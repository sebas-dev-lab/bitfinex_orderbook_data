/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Redis from 'ioredis';
import { RedisConnection } from '../../../Infraestrucure/decorators/redis_conn.decorators';
import Subscriptions from '../../../core/subscriptions/subscriptions.class';
import { EventEmitter } from 'events';
import MainGateway from '../gateway/main.gateway';
import { redisEnvs } from '../../../Infraestrucure/server/envs/envs';

@RedisConnection({
    port: redisEnvs.redis_port,
    host: redisEnvs.redis_host,
})
export default class SubscribeUsecases {
    private redisClient!: Redis;
    private redisSubscriber!: Redis;
    private subscription = Subscriptions.getInstance();
    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(private readonly connId: string) {}

    private getSubscription(pair: string): {
    pair: string
    conn_id: string
  } | null {
        const subs = this.subscription?.get(pair);
        if (subs) {
            return {
                pair: pair[0],
                conn_id: subs[1]
            };
        }
        return null;
    }

    private async getFromRedis(pair: string): Promise<any> {
        const data = await this.redisClient.get(`orderbook:${pair}`);
        return data ? JSON.parse(data) : null;
    }

    private async deleteFromRedis(pair: string): Promise<void> {
        await this.redisClient.del(`orderbook:${pair}`);
    }

    private subscribeControl(pair: string, event: string, id: string): boolean {
        if (event === 'subscribe') {
            this.subscription?.setNewSubscribed(id, pair);
            return true;
        } else if (event === 'unsubscribe') {
            this.subscription?.deleteFromPairSubscribed(pair, id);
            this.unsubscribeFromChannel(`orderbook:${pair}:update`, pair);
            return false;
        } else {
            throw new Error('Unrecognized event');
        }
    }

    private async subscribeToBtfx(pair: string): Promise<void> {
        const mainGateway = MainGateway.getInstance();
        await mainGateway?.subscribe(pair);
    }

    private async unsubscribeFromChannel(channel: string, pair: string) {
        try {
            // Desuscribirse del canal
            await this.redisSubscriber.unsubscribe(channel);
            const subscriptions = this.subscription?.get(pair);
            if (!subscriptions?.length) {
                this.subscription?.deletePair(pair);
                await this.redisSubscriber.quit();
                const mainGateway = MainGateway.getInstance();
                mainGateway?.unsubscribePair(pair);
                await this.deleteFromRedis(pair);
            }
        } catch (error) {
            console.error(`Error al desuscribirse del canal ${channel}:`, error);
        }
    }

    async getOrderBook(pair: string): Promise<void> {
    // Suscribirse a un canal específico
        this.redisSubscriber.subscribe(`orderbook:${pair}:update`);

        // Manejar mensajes recibidos en el canal
        this.redisSubscriber.on('message', async (channel, message) => {
            const control = this.subscription?.get(pair);
            const connId = control?.find((x) => x === this.connId);

            if (channel === `orderbook:${pair}:update` && connId) {
                this.eventEmitter.emit(`orderbook:${pair}:update`);
            }
        });
    }

    async getOrderBookError(pair: string): Promise<void> {
        // Suscribirse a un canal específico
        this.redisClient.set(`orderbook:${pair}:error`, 'error');
    }
    

    async listenForUpdates(pair: string, callback: (data: any) => void): Promise<void> {
    // Escuchar eventos emitidos por la suscripción al canal
        this.eventEmitter.on(`orderbook:${pair}:update`, callback);
    }

    async disconect(id: string): Promise<void> {
        const pairs = this.subscription?.deleteSubscribedFromAllPairs(id);

        if (pairs && pairs.length) {
            for (const pair of pairs) {
                this.unsubscribeFromChannel(`orderbook:${pair}:update`, pair);
            }
        }
    }

    async onProcess(pair: string, event: string): Promise<void> {
        const controlSubscription = this.subscribeControl(pair, event, this.connId);

        if (controlSubscription) {
            const pairControl = await this.getFromRedis(pair);
            if (!pairControl) {
                await this.subscribeToBtfx(pair);
            }
        }
    }
}
