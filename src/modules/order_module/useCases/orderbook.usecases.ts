import Subscriptions from '../../../core/subscriptions/subscriptions.class';
import OrderBookService, { Order } from '../../data_module/gateway/connect.gateway';
import MainGateway from '../../data_module/gateway/main.gateway';
import { v4 as uuidv4 } from 'uuid';

export default class OrderBookUseCases {
    private readonly mainGateway = MainGateway.getInstance();
    private readonly subscription = Subscriptions.getInstance();

    async subscribe(pair: string): Promise<string> {
        const connId = uuidv4();
        this.subscription?.setNewSubscribed(connId, pair);
        await this.mainGateway?.subscribe(pair);
        return connId;
    }

    async unsubscribe(pair: string, connId: string): Promise<void> {
        const subscription = this.subscription?.get(pair);
        if (subscription && subscription?.length > 1) {
            this.subscription?.deleteFromPairSubscribed(pair, connId);
        } else if (subscription && subscription.length === 1 && subscription[0] === connId) {
            this.subscription?.deletePair(pair);
            this.mainGateway?.unsubscribePair(pair);
        }
    }

    async getSubcribedData(pair: string): Promise<OrderBookService | undefined> {
        const connPair = this.mainGateway?.get(pair);
        return connPair;
    }

    async controlData(connPair: OrderBookService): Promise<{
        error: boolean
        finish: boolean
    }> {
        return connPair.controlData();
    }

    async getEffectivePrice(
        connPair: OrderBookService,
        operationType: 'buy' | 'sell',
        amount: number
    ): Promise<{
        finish: boolean;
        price: number | null;
        error: boolean;
    }> {
        return await connPair.getEffectivePrice(operationType, amount);
    }

    async getOrderBookTips(
        connPair: OrderBookService
    ): Promise<{ bid: Order | null; ask: Order | null, error: boolean }> {
        return await connPair.getOrderBookTips();
    }
}
