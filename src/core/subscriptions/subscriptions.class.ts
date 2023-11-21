/* eslint-disable @typescript-eslint/no-empty-function */
import { SubscriptionsInterface } from './subscriptions.interface';

// ----- Singleton pattern --------- //
export default class Subscriptions implements SubscriptionsInterface {
    private static instance: Subscriptions | null = null;
    private constructor() {}
    public static getInstance(): Subscriptions | null {
        if(!Subscriptions.instance) {
            Subscriptions.instance = new Subscriptions();
        }
        return Subscriptions.instance;
    }

    // ======== Subscriptions ======== //
    suscriptions: Map<string, string[] | undefined> = new Map([]);

    // ======== Methods ========= //
    get(pair: string): string[] | undefined {
        return this.suscriptions.get(pair);
    }

    deleteSubscribedFromAllPairs(id: string): string[] {
        const pairs: string[] = [];
        const subscription = Array.from(this.suscriptions);

        for (const [key, value] of subscription) {
            if (value) {
                const control = value.find(subscriberId => subscriberId === id);
                if (control) {
                    pairs.push(key);
                }
                const filteredValues = value.filter(subscriberId => subscriberId !== id);
                this.suscriptions.delete(key);
                this.suscriptions.set(key, filteredValues);
            }
        }

        return pairs;
    }

    deleteFromPairSubscribed(pair: string, id: string): void {
        let Ids = this.suscriptions.get(pair);
        Ids = Ids?.filter((_id) => _id !== id);
        this.deletePair(pair);
        this.setSubscribers(pair, Ids);
    }

    deletePair(pair: string): void {
        this.suscriptions.delete(pair);
    }

    setNewSubscribed(id: string, pair: string): void {
        const Ids = this.suscriptions.get(pair) ? this.suscriptions.get(pair) : [];
        Ids?.push(id);
        this.deletePair(pair);
        this.setSubscribers(pair, Ids);
    }

    setSubscribers(pair: string, Ids: string[] | undefined): void {
        this.suscriptions.set(pair, Ids);
    }
}
