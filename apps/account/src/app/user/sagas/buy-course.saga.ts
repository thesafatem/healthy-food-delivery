import { RMQService } from "nestjs-rmq";
import { UserEntity } from "../entities/user.entity";
import { PurchaseState } from "@healthy-food-delivery/interfaces";
import { BuyCourseSagaStateStarted } from "./buy-course.steps";

export class BuyCourseSaga {
    private state: any;

    constructor(
        public user: UserEntity, 
        public courseId: string,
        public rmqService: RMQService
    ) { }

    public getState() {
        return this.state;
    }

    public setState(state: PurchaseState, courseId: string) {
        switch(state) {
            case PurchaseState.Started:
                this.state = new BuyCourseSagaStateStarted();
                break;
            case PurchaseState.WaitingForPayment:
                break;
            case PurchaseState.Purchased:
                break;
            case PurchaseState.Cancelled:
                break;
        }
        this.state.setContext(this);
        this.user.updateCoursePurchaseState(courseId, state);
    }
}