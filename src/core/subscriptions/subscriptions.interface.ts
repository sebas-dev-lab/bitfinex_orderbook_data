import { Id } from '../clientConnection/clientConnection.interface';

export interface SubscriptionsInterface {
  suscriptions: Map<string, Id[] | undefined> // pair-Id client
  get(pair: string): Id[] | undefined
  deleteFromPairSubscribed(pair: string, id: Id): void
  deletePair(pair: string): void
  setNewSubscribed(id: Id, pair: string): void
  setSubscribers(pair: string, Ids: string[] | undefined): void
}
