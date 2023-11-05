import { AccountUpdateProfile } from '@healthy-food-delivery/contracts';
import { IUser } from '@healthy-food-delivery/interfaces';
import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { RMQService } from 'nestjs-rmq';
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { UserEventEmitter } from './user.event-emitter';

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly rmqService: RMQService,
		private readonly userEventEmitter: UserEventEmitter
	) { }

	public async updateProfile(user: Pick<IUser, 'name' | 'email'>, _id: string): Promise<AccountUpdateProfile.Response> {
		const existedUser = await this.userRepository.findUserById(_id);
		if (!existedUser) {
			throw Error('No such user!');
		}
		const updatedUser = new UserEntity(existedUser).setName(user.name).setEmail(user.email);
		await this.updateUser(updatedUser);
		return updatedUser;
	}

	public async buyCourse(userId: string, courseId: string) {
		const existedUser = await this.userRepository.findUserById(userId);
		if (!existedUser) {
			throw new Error('No such user.');
		}
		const userEntity = new UserEntity(existedUser);
		const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
		const { user, paymentLink } = await saga.getState().pay();
		await this.updateUser(user);
		return { paymentLink };
	}

	public async checkPayment(userId: string, courseId: string) {
		const existedUser = await this.userRepository.findUserById(userId);
		if (!existedUser) {
			throw new Error('No such user.');
		}
		const userEntity = new UserEntity(existedUser);
		const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
		const { status } = await saga.getState().checkPayment();
		await this.updateUser(userEntity);
		return { status };
	}

	private updateUser(user: UserEntity) {
		return Promise.all([
			this.userRepository.updateUserById(user),
			this.userEventEmitter.handle(user),
		])
	}
}