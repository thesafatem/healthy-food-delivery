import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser, IUserCourse, PurchaseState, UserRole } from '@healthy-food-delivery/interfaces';

@Schema()
export class UserCourse extends Document implements IUserCourse {
	@Prop({ required: true })
	courseId: string;

	@Prop({ required: true, enum: PurchaseState, type: String })
	purchaseState: PurchaseState;
}

export const UserCourseSchema = SchemaFactory.createForClass(UserCourse);

@Schema()
export class User extends Document implements IUser {
	@Prop()
	name: string;

	@Prop({ required: true })
	email: string;

	@Prop({ required: true })
	passwordHash: string;

	@Prop({ required: true, enum: UserRole, type: String, default: UserRole.User })
	role: UserRole;

	@Prop({ type: [UserCourseSchema], _id: false })
	courses: Types.Array<UserCourse>
}

export const UserSchema = SchemaFactory.createForClass(User);