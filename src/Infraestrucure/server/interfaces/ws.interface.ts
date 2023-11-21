import WebSocket, { Server } from 'ws';
import SubscribeUsecases from '../../../modules/data_module/useCases/subscribe.usecases';

export interface WsConnectionInterface {
  connect(): void
  disconnect(id: string,processData: SubscribeUsecases): void
  publicConnection(connId: string, websocket: WebSocket): void
  setServer(server: Server): void
  start(port: number): void
}
