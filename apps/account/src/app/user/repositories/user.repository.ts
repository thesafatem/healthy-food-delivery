import { InjectModel } from '@nestjs/mongoose';
import { User } from '../models/user.model';
import { Model } from 'mongoose';
import { UserEntity } from '../entities/user.entity';

export class UserRepository {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>
	) { }

	async createUser(user: UserEntity): Promise<User> {
		const newUser = new this.userModel(user);
		return newUser.save();
	}

	async findUserByEmail(email: string): Promise<User> {
		return this.userModel.findOne({ email }).exec();
	}

	async deleteUserByEmail(email: string): Promise<void> {
		this.userModel.deleteOne({ email }).exec();
	}
}