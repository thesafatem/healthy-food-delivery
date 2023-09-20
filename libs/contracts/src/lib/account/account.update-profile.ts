import { IUser, IUserCourse, UserRole } from "@healthy-food-delivery/interfaces";
import { IsString } from "class-validator";

export namespace AccountUpdateProfile {
    export const topic = 'account.update-profile.command';
    
    export class Request {
        @IsString()
        _id: string;

        user: Pick<IUser, 'name' | 'email'>;
    }

    export class Response implements IUser {
        _id?: string;
        name: string;
        email: string;
        passwordHash: string;
        role: UserRole;
        courses?: IUserCourse[];
}
}