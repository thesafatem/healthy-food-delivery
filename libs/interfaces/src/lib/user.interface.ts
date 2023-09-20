export enum UserRole {
	User = 'User',
	Admin = 'Admin'
}

export enum PurchaseState {
	Started = 'Started',
	WaitingForPayment = 'WaitingForPayment',
	Purchased = 'Purchased',
	Cancelled = 'Cancelled'
}

export interface IUser {
	_id?: string;
	name: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	courses?: IUserCourse[];
}

export interface IUserCourse {
	courseId: string;
	purchaseState: PurchaseState;
}