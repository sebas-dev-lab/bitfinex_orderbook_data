import OrderBookService from './connect.gateway';

/* eslint-disable @typescript-eslint/no-empty-function */
export default class MainGateway {
    private static instance: MainGateway | null = null;
    private constructor() {}
    public static getInstance(): MainGateway | null {
        if (!MainGateway.instance) {
            MainGateway.instance = new MainGateway();
        }
        return MainGateway.instance;
    }

    pairSusbscriptions: Map<string, OrderBookService | undefined> = new Map([]);

    // ======== Methods ========= //
    async subscribe(pair: string): Promise<void> {
        const control = this.pairSusbscriptions.get(pair);
        if (!control) {
            const orderBook = new OrderBookService(pair);
            await orderBook.subscribeToOrderBook();
            this.setNewSubscribed(pair, orderBook);
        }
    }

    async unsubscribePair(pair: string): Promise<void> {
        const orderBook = this.pairSusbscriptions.get(pair);
        if (orderBook) {
            orderBook.unsubscribeFromOrderBook();
            this.pairSusbscriptions.delete(pair);
        }
    }

    get(pair: string): OrderBookService | undefined {
        return this.pairSusbscriptions.get(pair);
    }

    deleteFromPairSubscribed(pair: string): void {
        const control = this.pairSusbscriptions.get(pair);
        if (control) {
            this.deletePair(pair);
        }
    }

    deletePair(pair: string): void {
        this.pairSusbscriptions.delete(pair);
    }

    setNewSubscribed(pair: string, OrderBookService: OrderBookService): void {
        const pairs = this.pairSusbscriptions.get(pair);
        if (!pairs) {
            this.setSubscribers(pair.trim(), OrderBookService);
        }
    }

    setSubscribers(pair: string, pairUp: OrderBookService | undefined): void {
        this.pairSusbscriptions.set(pair, pairUp);
    }
}
