import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from '../configs/mongo.config';
import { INestApplication } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { AccountLogin, AccountRegister } from '@healthy-food-delivery/contracts';

const authLogin: AccountLogin.Request = {
	email: 'a@a.com',
	password: 'password'
}

const authRegister: AccountRegister.Request = {
	...authLogin,
	name: 'Jeeraffo'
};

describe('AuthCountroller', () => {
	let app: INestApplication;
	let userRepository: UserRepository;
	let rmqService: RMQTestService;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.account.env' }),
				RMQModule.forTest({}),
				UserModule,
				AuthModule,
				MongooseModule.forRootAsync(getMongoConfig())
			]
		}).compile();
		app = module.createNestApplication();
		userRepository = app.get<UserRepository>(UserRepository);
		rmqService = app.get<RMQTestService>(RMQService);
		await app.init();
	});

	it('Register', async () => {
		const res = await rmqService.triggerRoute<AccountRegister.Request, AccountRegister.Response>(AccountRegister.topic, authRegister);
		expect(res.email).toEqual(authRegister.email);
	});

	it('Login', async () => {
		const res = await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(AccountLogin.topic, authLogin);
		expect(res.access_token).toBeDefined();
	});

	afterAll(async () => {
		await userRepository.deleteUserByEmail(authRegister.email);
	});
});