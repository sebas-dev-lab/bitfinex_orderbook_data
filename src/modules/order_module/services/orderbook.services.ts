import { Order } from '../../data_module/gateway/connect.gateway';
import OrderBookUseCases from '../useCases/orderbook.usecases';

export type OrderbookType = {
    pair: string
    bid: Order | null
    ask: Order | null
    error: boolean;
    message: string;
  }

export default class OrderBookServices {
    private _orderBookCases =  new OrderBookUseCases();

    async getOrderBookTips(pair: string): Promise<OrderbookType> {
        const data: OrderbookType = {
            pair,
            bid: null,
            ask: null,
            error: false,
            message: ''
        };

        // Verifica si los tips están en caché
        const connPair = await this._orderBookCases.getSubcribedData(pair);

        if (connPair) {
            const orderBookTip = await this._orderBookCases.getOrderBookTips(connPair);
            data.ask = orderBookTip.ask;
            data.bid = orderBookTip.bid;
        } else {
            // Si no están en caché, realiza las siguientes operaciones
            const maxWaitTime = 30000; // Tiempo máximo de espera en milisegundos (30 segundos)
            const startTime = Date.now();

            const connId = await this._orderBookCases.subscribe(pair);

            const connPair = await this._orderBookCases.getSubcribedData(pair);

            while (Date.now() - startTime < maxWaitTime) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                if (connPair) {
    
                    const updatedTips = await this._orderBookCases.getOrderBookTips(connPair);

                    if (updatedTips.error) {
                        data.error = true;
                        data.message = 'Symbol Error';
                        await this._orderBookCases.unsubscribe(pair, connId);
                        return data;
                    }
                    if (updatedTips && (updatedTips.bid || updatedTips.ask)) {
                        data.bid = updatedTips?.bid;
                        data.ask = updatedTips?.ask;
                        break;
                    }
    
    
                }
            }
            // Desconecta la suscripción al orderbook
            //await this._orderBookCases.unsubscribe(pair, connId);
        }

        data.message = 'Connection Ok';
        return data;
    }
}
