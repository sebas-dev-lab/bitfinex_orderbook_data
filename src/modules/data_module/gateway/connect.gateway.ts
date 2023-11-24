/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import WebSocket from 'ws';
import Redis from 'ioredis'; // Cambia aquí para importar Redis como un módulo completo
import { RedisConnection } from '../../../Infraestrucure/decorators/redis_conn.decorators';
import { WebSocketConnection } from '../../../Infraestrucure/decorators/websocket_conn.decorators';
import Logger from '../../../common/configs/winston.logs';
import { bitfinexEnvs, redisEnvs } from '../../../Infraestrucure/server/envs/envs';

export interface Order {
  price: number
  count: number
  amount: number
}

@RedisConnection({
    port: redisEnvs.redis_port,
    host: redisEnvs.redis_host,
})
@WebSocketConnection(bitfinexEnvs.btfx_ws)
export default class OrderBookService {
    private ws!: WebSocket;
    private redisClient!: Redis;
    result = false;

    constructor(private pair: string) {}

    async subscribeToOrderBook() {
        this.ws.on('open', () => {
            const subscriptionMessage = {
                event: 'subscribe',
                channel: 'book',
                pair: `${this.pair}`,
                prec: 'P0',
                freq: 'F0',
                length: '25'
            };

            this.ws.send(JSON.stringify(subscriptionMessage));
        });

        this.ws.on('message', async (data) => {
            const dt = JSON.parse(data.toString());
            if (dt && !dt.event) {
                await this.handleMessage(JSON.parse(data.toString()));
            } else if (dt && dt.event && dt.event === 'error') {
                Logger.error(`INVALID PAIR: ${dt.event}; ${dt.pair}`);
                this.handleMessageError(dt);
            }
        });
    }

    async unsubscribeFromOrderBook() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            await this.deleteOrderbookTips();
            this.ws.close();
        }
    }

    private async handleMessage(message: any) {
        const [channelId, data] = message;

        if (Array.isArray(data[0])) {
            // Snapshot
            await this.processSnapshot(channelId, data);
        } else {
            // Update
            await this.processUpdate(channelId, message);
        }
    }

    private async handleMessageError(dt: any) {
        this.redisClient.set(`orderbook:${this.pair}:error`, 'error_pair_connection');
    }

    private async processSnapshot(channelId: number, snapshot: [[number, number, number][]]) {
        const orders = snapshot.map(([price, count, amount]) => {
            return { price, count, amount };
        });

        this.redisClient.set(`orderbook:${this.pair}`, JSON.stringify(orders));
        this.result = true;

        this.redisClient.publish(`orderbook:${this.pair}:update`, 'new_connection');
        await this.setOrderbookTips();
    }

    private async processUpdate(channelId: number, updateData: [number, number, number, number]) {
        const [price, count, amount] = updateData.slice(1);
        const order = { price, count, amount };

        // Obtiene el orderbook actual de Redis
        this.redisClient.get(`orderbook:${this.pair}`).then(async (orderBookString: string | null) => {
            let orders: Order[] = [];

            if (orderBookString) {
                orders = JSON.parse(orderBookString);
            }

            const index = orders.findIndex((existingOrder) => existingOrder.price === price);

            if (count === 0) {
                // Remove order if count is 0
                if (index !== -1) {
                    orders.splice(index, 1);
                }
            } else {
                // Update or add order
                if (index !== -1) {
                    orders[index] = order;
                } else {
                    orders.push(order);
                }
            }

            this.redisClient.set(`orderbook:${this.pair}`, JSON.stringify(orders));
            this.redisClient.publish(`orderbook:${this.pair}:update`, 'update_connection');

            await this.setOrderbookTips();
        });
    }

    private async getBestPrice(type: 'bid' | 'ask'): Promise<{
    order: Order | null
    error: boolean
  }> {
        const error = await this.redisClient.get(`orderbook:${this.pair}:error`);

        if (!error) {
            const orderBookKeys = await this.redisClient.keys(`orderbook:${this.pair}`);
            let bestOrder: Order | null = null;

            for (const orderBookKey of orderBookKeys) {
                const orderBookString = await this.redisClient.get(orderBookKey);
                const orders: Order[] = orderBookString ? JSON.parse(orderBookString) : [];

                // Encuentra el mejor precio (bid o ask) en todos los canales
                const currentBestOrder = orders.reduce((currentBest: Order | null, order: Order) => {
                    if (
                        (type === 'bid' && (currentBest === null || order.price > currentBest.price)) ||
            (type === 'ask' && (currentBest === null || order.price < currentBest.price))
                    ) {
                        return order;
                    }
                    return currentBest;
                }, null as Order | null);

                if (
                    !bestOrder ||
          (type === 'bid' && currentBestOrder && currentBestOrder.price > bestOrder.price) ||
          (type === 'ask' && currentBestOrder && currentBestOrder.price < bestOrder.price)
                ) {
                    bestOrder = currentBestOrder;
                }
            }

            return {
                order: bestOrder,
                error: false
            };
        }
        this.redisClient.del(`orderbook:${this.pair}:error`);
        this.unsubscribeFromOrderBook();
        return {
            order: null,
            error: false
        };
    }

    async setOrderbookTips(): Promise<void> {
        const error = await this.redisClient.get(`orderbook:${this.pair}:error`);
        if (!error) {
            const redisKey = `orderbook:${this.pair}:bestBidAsk`;
            const cachedData = await this.redisClient.get(redisKey);
            if (cachedData) {
                this.redisClient.del(redisKey);
            }
            const [bid, ask] = await Promise.all([this.getBestPrice('bid'), this.getBestPrice('ask')]);
            await this.redisClient.set(redisKey, JSON.stringify({ bid: bid.order, ask: ask.order }));
        } else {
            this.redisClient.del(`orderbook:${this.pair}:error`);
            this.redisClient.del(`orderbook:${this.pair}`);
            this.unsubscribeFromOrderBook();
        }
    }

    async deleteOrderbookTips(): Promise<void> {
        const redisKey = `orderbook:${this.pair}:bestBidAsk`;
        const cachedData = await this.redisClient.get(redisKey);
        if (cachedData) {
            this.redisClient.del(redisKey);
        }
    }

    async getOrderBookTips(): Promise<{ bid: Order | null; ask: Order | null; error: boolean }> {
        const error = await this.redisClient.get(`orderbook:${this.pair}:error`);

        if (!error) {
            const redisKey = `orderbook:${this.pair}:bestBidAsk`;
            const cachedData = await this.redisClient.get(redisKey);

            if (cachedData) {
                // Devuelve la información desde Redis si está en caché
                const { bid, ask } = JSON.parse(cachedData);
                return { bid, ask, error: false };
            } else {
                // Si no hay información en caché, realiza una nueva suscripción y espera la respuesta
                const [bid, ask] = await Promise.all([this.getBestPrice('bid'), this.getBestPrice('ask')]);

                // Guarda la información en caché en Redis
                await this.redisClient.set(redisKey, JSON.stringify({ bid: bid.order, ask: ask.order }));

                return { bid: bid.order, ask: ask.order, error: false };
            }
        } else {
            this.redisClient.del(`orderbook:${this.pair}:error`);
            this.redisClient.del(`orderbook:${this.pair}`);
            this.unsubscribeFromOrderBook();
            return {
                error: true,
                ask: null,
                bid: null
            };
        }
    }

    async controlData(): Promise<{
        error: boolean
        finish: boolean
    }> {
        const error = await this.redisClient.get(`orderbook:${this.pair}:error`);
        if (!error) {
            const orderBookKeys = await this.redisClient.get(`orderbook:${this.pair}`);
            if (orderBookKeys) {
                return {
                    error: false,
                    finish: true
                };
            } else {
                return {
                    error: false,
                    finish: false
                };
            }
        } else {
            return {
                error: true,
                finish: true
            };
        }
    }

    async getEffectivePrice(
        operationType: 'buy' | 'sell',
        amount: number
    ): Promise<{
    finish: boolean
    price: number | null
    error: boolean
  }> {
        const error = await this.redisClient.get(`orderbook:${this.pair}:error`);
        if (!error) {
            const orderBookKeys = await this.redisClient.keys(`orderbook:${this.pair}`);
            let remainingAmount = amount;
            let effectivePrice = null;

            for (const orderBookKey of orderBookKeys) {
                const orderBookString = await this.redisClient.get(orderBookKey);
                const orders: Order[] = orderBookString ? JSON.parse(orderBookString) : [];

                // Filtra las órdenes según el tipo de operación (buy o sell)
                const filteredOrders = orders.filter(
                    (order) =>
                        (operationType === 'buy' && order.amount > 0) ||
            (operationType === 'sell' && order.amount < 0)
                );

                // Itera sobre las órdenes filtradas
                for (const order of filteredOrders) {
                    const amountToConsider = Math.min(Math.abs(order.amount), remainingAmount);

                    // Calcula el precio efectivo acumulado
                    effectivePrice = (effectivePrice || 0) + amountToConsider * order.price;
                    remainingAmount -= amountToConsider;

                    // Si se ha acumulado la cantidad deseada, termina el bucle
                    if (remainingAmount <= 0) {
                        break;
                    }
                }

                // Si se ha acumulado la cantidad deseada, termina el bucle principal
                if (remainingAmount <= 0) {
                    break;
                }
            }

            // Calcula el precio efectivo final
            if (remainingAmount <= 0) {
                return {
                    finish: true,
                    price: effectivePrice! / amount,
                    error: false
                };
            } else {
                return {
                    finish: true,
                    price: null,
                    error: false
                };
            }
        } else {
            this.redisClient.del(`orderbook:${this.pair}:error`);
            this.redisClient.del(`orderbook:${this.pair}`);
            this.unsubscribeFromOrderBook();
            return {
                finish: true,
                price: null,
                error: true
            };
        }
    }
}