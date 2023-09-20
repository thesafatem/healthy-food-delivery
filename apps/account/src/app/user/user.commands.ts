import { AccountUpdateProfile, AccountGetInfo } from "@healthy-food-delivery/contracts";
import { Body, Controller } from "@nestjs/common";
import { RMQRoute, RMQValidate } from "nestjs-rmq";
import { UserRepository } from "./repositories/user.repository";
import { UserEntity } from "./entities/user.entity";

@Controller()
export class UserCommands {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    @RMQValidate()
    @RMQRoute(AccountUpdateProfile.topic)
    async updateProfile(@Body() { _id, user: { name, email } }: AccountUpdateProfile.Request): Promise<AccountUpdateProfile.Response> {
        const existedUser = await this.userRepository.findUserById(_id);
        if (!existedUser) {
            throw Error('No such user!');
        }
        const updatedUser = new UserEntity(existedUser).setName(name).setEmail(email);
        return await this.userRepository.updateUserById(updatedUser);
    }
}