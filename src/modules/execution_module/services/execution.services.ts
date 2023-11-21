import OrderBookService from '../../data_module/gateway/connect.gateway';
import OrderBookUseCases from '../../order_module/useCases/orderbook.usecases';

export type EffectivePrice = {
  pair: string
  effectivePrice: number | null
  operation: 'buy' | 'sell'
  message: string
  amount: number
  error: boolean
}

export default class ExecutionModuleService {
    private _orderBookCases = new OrderBookUseCases();

    async getEffectivePriceService(
        pair: string,
        operation: 'buy' | 'sell',
        amount: number
    ): Promise<EffectivePrice> {
        const data: EffectivePrice = {
            pair,
            amount,
            operation,
            message: '',
            effectivePrice: null,
            error: false
        };

        // Verifica si los tips están en caché
        const connPair = await this._orderBookCases.getSubcribedData(pair);

        if (connPair) {
            const effectivePrice = await this._orderBookCases.getEffectivePrice(
                connPair,
                operation,
                amount
            );
            data.effectivePrice = effectivePrice.price;
        } else {
            const connId = await this._orderBookCases.subscribe(pair);
            const control = await this.waitForWebSocketData(pair);
            if (!control?.error) {
                const connPair = await this._orderBookCases.getSubcribedData(pair);

                if (connPair) {
                    const effectivePrice = await this._orderBookCases.getEffectivePrice(
                        connPair,
                        operation,
                        amount
                    );

                    if (effectivePrice.error) {
                        data.error = true;
                        data.message = 'Symbol Error';
                        await this._orderBookCases.unsubscribe(pair, connId);
                        return data;
                    }

                    data.effectivePrice = effectivePrice.price;
                }
            } else {
                data.error = true;
                data.message = 'Symbol or Connection Error';
                await this._orderBookCases.unsubscribe(pair, connId);
                return data;
            }
        }
        data.message = data.effectivePrice
            ? 'Efective Price'
            : 'There are not enough orders to satisfy the desired quantity';
        return data;
    }

    private async waitForWebSocketData(pair: string): Promise<{
        error: boolean
        finish: boolean
      }
    | undefined
  > {
        const maxWaitTime = 30000; // Tiempo máximo de espera en milisegundos (30 segundos)
        const startTime = Date.now();

        let connPair: OrderBookService | undefined;

        while (Date.now() - startTime < maxWaitTime) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            connPair = await this._orderBookCases.getSubcribedData(pair);

            if (connPair) {
                // Si se ha establecido la conexión y se ha almacenado la data en Redis, termina la espera
                const control = await this._orderBookCases.controlData(connPair);
                if (control.finish && !control.error) {
                    return {
                        error: false,
                        finish: true
                    };
                } else {
                    return {
                        error: true,
                        finish: true
                    };
                }
            }
        }
    }
}
