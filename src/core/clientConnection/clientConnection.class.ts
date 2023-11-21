import { WebSocket } from 'ws';
import { ClientConnnectionInterface, Id, Pair } from './clientConnection.interface';
import * as uuid from 'uuid';

export default class ClientConnection implements ClientConnnectionInterface {
    _id: Id;
    date_connection: Date = new Date();
    current_ws_pair: Pair | null = null;
    history_subscription!: Pair[];
    private ws: WebSocket;

    constructor(websocket: WebSocket, _id?: Id) {
        this._id = _id ? _id : uuid.v4();
        this.ws = websocket;
    }

    getCurrentWsPair(): Pair | null {
        return this.current_ws_pair;
    }
    getHistorySubscription(): Pair[] {
        return this.history_subscription;
    }
    setCurrentWsPair(newPair: Pair): void {
        this.current_ws_pair = newPair;
    }
    setHistorySubscription(newPair: Pair): void {
        this.history_subscription.push(newPair);
    }
    getConnection(): {ws: WebSocket, _id: Id} {
        return {
            ws: this.ws,
            _id: this._id
        };
    }
}
