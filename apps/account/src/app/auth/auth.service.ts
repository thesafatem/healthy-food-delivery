import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { UserEntity } from '../user/entities/user.entity';
import { UserRole } from '@healthy-food-delivery/interfaces';
import { User } from '../user/models/user.model';
import { JwtService } from '@nestjs/jwt';
import { AccountRegister } from '@healthy-food-delivery/contracts';

@Injectable()
export class AuthService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtService
	) { }

	async register({ email, password, name }: AccountRegister.Request): Promise<User> {
		const oldUser = await this.userRepository.findUserByEmail(email);
		if (oldUser) {
			throw new Error('User is already exists');
		}
		const newUserEntity = await new UserEntity({
			email,
			name,
			role: UserRole.User
		}).setPassword(password);
		const newUser = await this.userRepository.createUser(newUserEntity);
		return newUser;
	}

	async validateUser(email: string, password: string) {
		const user = await this.userRepository.findUserByEmail(email);
		if (!user) {
			throw new Error('Invalid login or password');
		}
		const userEntity = new UserEntity(user);
		const isCorrectPassword = await userEntity.validatePassword(password);
		if (!isCorrectPassword) {
			throw new Error('Invalid login or password');
		}
		return { id: user._id }
	}

	async login(id: string) {
		return {
			access_token: await this.jwtService.signAsync({ id })
		}
	}
}
