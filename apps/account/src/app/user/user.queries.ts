import { AccountGetCourses, AccountGetInfo } from "@healthy-food-delivery/contracts";
import { Body, Controller } from "@nestjs/common";
import { RMQValidate, RMQRoute } from "nestjs-rmq";
import { UserRepository } from "./repositories/user.repository";

@Controller()
export class UserQueries {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    @RMQValidate()
    @RMQRoute(AccountGetInfo.topic)
    async getInfo(@Body() { id }: AccountGetInfo.Request): Promise<AccountGetInfo.Response> {
        const user = await this.userRepository.findUserById(id);
        return { user };
    }

    @RMQValidate()
    @RMQRoute(AccountGetCourses.topic)
    async getCourses(@Body() { id }: AccountGetCourses.Request): Promise<AccountGetCourses.Response> {
        const user = await this.userRepository.findUserById(id);
        return { courses: user.courses }
    }
}