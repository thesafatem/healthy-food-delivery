import { AccountUpdateProfile, AccountGetInfo, AccountBuyCourse, AccountCheckPayment } from "@healthy-food-delivery/contracts";
import { Body, Controller } from "@nestjs/common";
import { RMQRoute, RMQService, RMQValidate } from "nestjs-rmq";
import { UserRepository } from "./repositories/user.repository";
import { UserEntity } from "./entities/user.entity";
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { UserService } from './user.service';

@Controller()
export class UserCommands {
	constructor(
		private readonly userService: UserService,
	) { }

	@RMQValidate()
	@RMQRoute(AccountUpdateProfile.topic)
	async updateProfile(@Body() { _id, user }: AccountUpdateProfile.Request): Promise<AccountUpdateProfile.Response> {
		return this.userService.updateProfile(user, _id);
	}

	@RMQValidate()
	@RMQRoute(AccountBuyCourse.topic)
	async buyCourse(@Body() { userId, courseId }: AccountBuyCourse.Request): Promise<AccountBuyCourse.Response> {
		return this.userService.buyCourse(userId, courseId);
	}

	@RMQValidate()
	@RMQRoute(AccountCheckPayment.topic)
	async checkPayment(@Body() { userId, courseId }: AccountCheckPayment.Request): Promise<AccountCheckPayment.Response> {
		return this.userService.checkPayment(userId, courseId);
	}
}