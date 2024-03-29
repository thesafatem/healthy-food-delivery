import { AccountChangedCourse } from '@healthy-food-delivery/contracts';
import { IDomainEvent, IUser, IUserCourse, PurchaseState, UserRole } from '@healthy-food-delivery/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';

export class UserEntity implements IUser {
	_id?: string;
	name: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	courses?: IUserCourse[];
	events: IDomainEvent[] = [];

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

	public setName(name: string): this {
		this.name = name;
		return this;
	}

	public setEmail(email: string): this {
		this.email = email;
		return this;
	}

	public addCourse(courseId: string) {
		const isExist = this.courses.find(c => c.courseId === courseId);
		if (isExist) {
			throw new Error('Курс уже существует!');
		}
		this.courses.push({
			courseId: courseId,
			purchaseState: PurchaseState.Started
		});
	}

	public deleteCourse(courseId: string) {
		this.courses = this.courses.filter(c => c.courseId != courseId);
	}

	public setCoursePurchaseState(courseId: string, state: PurchaseState) {
		const isExist = this.courses.find(c => c.courseId == courseId);
		if (!isExist) {
			this.courses.push({
				courseId,
				purchaseState: state
			});
			return this;
		}
		if (state == PurchaseState.Cancelled) {
			this.courses = this.courses.filter(c => c.courseId !== courseId);
			return this;
		}
		this.courses = this.courses.map(c => {
			if (c.courseId == courseId) {
				c.purchaseState = state;
			}
			return c;
		});
		this.events.push({
			topic: AccountChangedCourse.topic,
			data: { courseId, userId: this._id, state }
		});
		return this;
	}

	public getCourseState(courseId: string): PurchaseState {
		return this.courses.find(c => c.courseId == courseId)?.purchaseState ?? PurchaseState.Started;
	}
}