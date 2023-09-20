import { IsString } from "class-validator";
import { IUser } from '@healthy-food-delivery/interfaces'

export namespace AccountGetInfo {
    export const topic = 'account.get-info.query';

    export class Request {
        @IsString()
        id: string
    }

    export class Response {
        user: Omit<IUser, 'passwordHash'>;
    }
}