import { WebSocket } from 'ws';

export type Id = string
export interface Pair {
  _pair: string
  _date: Date
}

export interface ClientConnnectionInterface {
  _id: Id
  date_connection: Date // last time connection
  current_ws_pair: Pair | null
  history_subscription: Array<Pair>
  getCurrentWsPair(): Pair | null
  getHistorySubscription(): Array<Pair>
  setCurrentWsPair(newPair: Pair): void
  setHistorySubscription(newPair: Pair): void
  getConnection(): { ws: WebSocket; _id: Id }
}
