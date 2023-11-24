import WebSocket, { Server } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import Logger from '../../../common/configs/winston.logs';
import { WsConnectionInterface } from '../interfaces/ws.interface';
import Context from '../../../core/context/context.class';
import ClientConnection from '../../../core/clientConnection/clientConnection.class';
import SubscribeUsecases from '../../../modules/data_module/useCases/subscribe.usecases';
import { Redis } from 'ioredis';
import { RedisConnection } from '../../decorators/redis_conn.decorators';
import { redisEnvs } from '../envs/envs';

@RedisConnection({
    port: redisEnvs.redis_port,
    host: redisEnvs.redis_host,
})
export class WsConnectionAbstract implements WsConnectionInterface {
    private redisClient!: Redis;
    private server: Server | null = null;
    private context: Context = Context.getInstance();
    private options: any;

    constructor(options?: any) {
        this.options = options;
        this.flushAll();
    }

    connect(): void {
        this.server?.on('connection', (websocket: WebSocket) => {
            const connId = uuidv4();
            this.publicConnection(connId, websocket);
        });
    }

    async disconnect(id: string, processData: SubscribeUsecases): Promise<void> {
    // ============ Disconnect ============= //
        Logger.info(`Disconnected client id: ${id}`);
        const conn = this.context.get(id);
        const socket = conn?.getConnection();
        try {
            socket?.ws.close();
            this.context.delete(id);
            processData.disconect(id);
        } catch (e: any) {
            Logger.error(e.stack);
            socket?.ws.close();
        }
    }

    publicConnection(connId: string, websocket: WebSocket): void {
        try {
            const client = new ClientConnection(websocket, connId);
            this.context.set(connId, client);
            const processData = new SubscribeUsecases(connId);

            websocket.on('message', async (data: WebSocket.Data) => {
                const event = JSON.parse(data.toString());

                await processData.onProcess(event.pair, event.event);

                await processData.getOrderBook(event.pair);
                await processData.listenForUpdates(event.pair, async (dt) => {
                    const initialData = await this.redisClient.get(`orderbook:${event.pair}`);

                    const parsedInitialData = initialData ? initialData.toString() : null;

                    websocket.send(JSON.stringify(parsedInitialData));
                });
            });

            websocket.on('close', async() => {
                await this.disconnect(connId, processData);
            });

        } catch (e: any) {
            Logger.error(e.stack);
            this.context.delete(connId);
            websocket.close();
        }
    }

    setServer(server: Server): void {
        this.server = server;
        this.connect();
    }

    start(port: number): void {
        this.server = new WebSocket.Server({
            port,
            ...this.options
        });
    }

    private async flushAll(): Promise<void> {
        const redisClient = new Redis();

        try {
            // Ejecutar el comando FLUSHALL para eliminar todos los datos
            await redisClient.flushall();
        } catch (error: any) {
            Logger.error('Error al intentar eliminar todos los datos en Redis:', error.stack);
        } finally {
            // Cerrar la conexión con Redis
            await redisClient.quit();
        }
    }
}
