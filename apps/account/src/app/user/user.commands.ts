import { AccountUpdateProfile, AccountGetInfo, AccountBuyCourse, AccountCheckPayment } from "@healthy-food-delivery/contracts";
import { Body, Controller } from "@nestjs/common";
import { RMQRoute, RMQService, RMQValidate } from "nestjs-rmq";
import { UserRepository } from "./repositories/user.repository";
import { UserEntity } from "./entities/user.entity";
import { BuyCourseSaga } from './sagas/buy-course.saga';

@Controller()
export class UserCommands {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly rmqService: RMQService
	) { }

	@RMQValidate()
	@RMQRoute(AccountUpdateProfile.topic)
	async updateProfile(@Body() { _id, user: { name, email } }: AccountUpdateProfile.Request): Promise<AccountUpdateProfile.Response> {
		const existedUser = await this.userRepository.findUserById(_id);
		if (!existedUser) {
			throw Error('No such user!');
		}
		const updatedUser = new UserEntity(existedUser).setName(name).setEmail(email);
		return await this.userRepository.updateUserById(updatedUser);
	}

	@RMQValidate()
	@RMQRoute(AccountBuyCourse.topic)
	async buyCourse(@Body() { userId, courseId }: AccountBuyCourse.Request): Promise<AccountBuyCourse.Response> {
		const existedUser = await this.userRepository.findUserById(userId);
		if (!existedUser) {
			throw new Error('No such user.');
		}
		const userEntity = new UserEntity(existedUser);
		const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
		const { user, paymentLink } = await saga.getState().pay();
		await this.userRepository.updateUserById(user);
		return { paymentLink };
	}

	@RMQValidate()
	@RMQRoute(AccountCheckPayment.topic)
	async checkPayment(@Body() { userId, courseId }: AccountCheckPayment.Request): Promise<AccountCheckPayment.Response> {
		const existedUser = await this.userRepository.findUserById(userId);
		if (!existedUser) {
			throw new Error('No such user.');
		}
		const userEntity = new UserEntity(existedUser);
		const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
		const { status } = await saga.getState().checkPayment();
		return { status };
	}
}