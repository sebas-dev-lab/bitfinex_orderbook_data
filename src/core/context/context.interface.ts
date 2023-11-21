import { ClientConnnectionInterface, Id } from '../clientConnection/clientConnection.interface';

export interface ContextInterface {
  store: Map<string, ClientConnnectionInterface>;
  get(_id: Id): ClientConnnectionInterface | undefined;
  getAll(): Array<ClientConnnectionInterface>
  delete(_id: Id): void
  cleanContext(): void
  set(_id: Id, client: ClientConnnectionInterface): void
}
