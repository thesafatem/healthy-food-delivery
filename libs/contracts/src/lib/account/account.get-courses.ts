import { IUserCourse } from "@healthy-food-delivery/interfaces";
import { IsString } from "class-validator";

export namespace AccountGetCourses {
    export const topic = 'account.get-courses.query';

    export class Request {
        @IsString()
        id: string;
    }

    export class Response {
        courses: IUserCourse[];
    }
}