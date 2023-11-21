/* eslint-disable @typescript-eslint/no-empty-function */
import { ClientConnnectionInterface, Id } from '../clientConnection/clientConnection.interface';
import { ContextInterface } from './context.interface';

// ----- Singleton pattern --------- //
export default class Context implements ContextInterface {
    private static instance: Context | null = null;
    private constructor() {}
    public static getInstance(): Context {
        if (!Context.instance) {
            Context.instance = new Context();
        }
        return Context.instance;
    }

    // ===== Store context ======= //
    store: Map<string, ClientConnnectionInterface> = new Map();
    // ===== Methods ======= //
    get(_id: Id): ClientConnnectionInterface | undefined {
        return this.store.get(_id);
    }

    getAll(): ClientConnnectionInterface[] {
        return Array.from(this.store.values());
    }

    delete(_id: Id): void {
        this.store.delete(_id);
    }

    cleanContext(): void {
        this.store.clear();
    }

    set(_id: Id, client: ClientConnnectionInterface): void {
        this.store.set(_id, client);
    }
}
