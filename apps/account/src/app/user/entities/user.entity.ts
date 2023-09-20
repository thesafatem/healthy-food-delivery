import { IUser, IUserCourse, UserRole } from '@healthy-food-delivery/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
	_id?: string;
	name: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	courses?: IUserCourse[];

	constructor(user: IUser | Omit<IUser, 'passwordHash'>) {
		this._id = user._id;
		this.name = user.name;
		this.email = user.email;
		this.role = user.role;
		this.courses = user.courses;
		if ('passwordHash' in user) {
			this.passwordHash = user.passwordHash;
		}
	}

	public async setPassword(password: string): Promise<this> {
		const salt = await genSalt(10);
		this.passwordHash = await hash(password, salt);
		return this;
	}

	public validatePassword(password: string): Promise<boolean> {
		return compare(password, this.passwordHash);
	}
}