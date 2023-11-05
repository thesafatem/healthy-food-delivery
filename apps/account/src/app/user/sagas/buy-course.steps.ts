import { CourseGetCourse, PaymentCheck, PaymentGenerateLink, PaymentStatus } from "@healthy-food-delivery/contracts";
import { UserEntity } from "../entities/user.entity";
import { BuyCourseSagaState } from "./buy-course.state";
import { PurchaseState } from "@healthy-food-delivery/interfaces";

export class BuyCourseSagaStateStarted extends BuyCourseSagaState {
	public async pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
		const { course } = await this.saga.rmqService.send<CourseGetCourse.Request, CourseGetCourse.Response>(CourseGetCourse.topic, {
			id: this.saga.courseId
		});
		if (!course) {
			throw new Error('No such course!');
		}
		if (course.price === 0) {
			this.saga.setState(PurchaseState.Purchased, course._id);
			return { paymentLink: null, user: this.saga.user };
		}
		const { paymentLink } = await this.saga.rmqService.send<PaymentGenerateLink.Request, PaymentGenerateLink.Response>(PaymentGenerateLink.topic, {
			courseId: course._id,
			userId: this.saga.user._id,
			sum: course.price
		});
		this.saga.setState(PurchaseState.WaitingForPayment, course._id);
		return { paymentLink, user: this.saga.user };
	}
	public checkPayment(): Promise<{ user: UserEntity, status: PaymentStatus }> {
		throw new Error('Check of uninitialized payment is not possible!');
	}
	public async cancel(): Promise<{ user: UserEntity; }> {
		this.saga.setState(PurchaseState.Cancelled, this.saga.courseId);
		return { user: this.saga.user };
	}
}

export class BuyCourseSagaStateProcess extends BuyCourseSagaState {
	public pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
		throw new Error('Can\'t create link for the already processing payment.');
	}
	public async checkPayment(): Promise<{ user: UserEntity, status: PaymentStatus }> {
		const { status } = await this.saga.rmqService.send<PaymentCheck.Request, PaymentCheck.Response>(PaymentCheck.topic, {
			userId: this.saga.user._id,
			courseId: this.saga.courseId
		});
		if (status === 'cancelled') {
			this.saga.setState(PurchaseState.Cancelled, this.saga.courseId);
			return {
				user: this.saga.user,
				status
			};
		}
		if (status !== 'success') {
			return {
				user: this.saga.user,
				status
			};
		}
		this.saga.setState(PurchaseState.Purchased, this.saga.courseId);
		return { user: this.saga.user, status };
	}
	public cancel(): Promise<{ user: UserEntity; }> {
		throw new Error('Can\'t cancel the payment while processing.');
	}
}

export class BuyCourseSagaStatePurchased extends BuyCourseSagaState {
	public pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
		throw new Error('Can\'t pay for the already paid course.');
	}
	public checkPayment(): Promise<{ user: UserEntity, status: PaymentStatus }> {
		throw new Error('Can\'t check payment of the already paid course.');
	}
	public cancel(): Promise<{ user: UserEntity; }> {
		throw new Error('Can\'t cancel purchase of the already purchased course.');
	}
}

export class BuyCourseSagaCancelled extends BuyCourseSagaState {
	public pay(): Promise<{ paymentLink: string; user: UserEntity; }> {
		this.saga.setState(PurchaseState.Started, this.saga.courseId);
		return this.saga.getState().pay();
	}
	public checkPayment(): Promise<{ user: UserEntity, status: PaymentStatus }> {
		throw new Error('Can\'t check payment of the already cancelled course.');
	}
	public cancel(): Promise<{ user: UserEntity; }> {
		throw new Error('Can\'t cancel purchase of the already cancelled course.');
	}
}