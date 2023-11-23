import { highDemandCryptoCurrencies } from '../../common/data_dump/highDemand.data_dump';
import OrderBookUseCases from '../order_module/useCases/orderbook.usecases';

export default async function highDemandCryptoCurrenciesFn(): Promise<void> {
    for (const h of highDemandCryptoCurrencies) {
        const pair = new OrderBookUseCases();
        await pair.subscribe(h);
    }
}
