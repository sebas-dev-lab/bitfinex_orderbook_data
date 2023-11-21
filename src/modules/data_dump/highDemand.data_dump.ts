import { highDemandCryptoCurrencies } from '../../common/data_dump/highDemand.data_dump';
import OrderBookUseCases from '../order_module/useCases/orderbook.usecases';

export default async function highDemandCryptoCurrenciesFn(): Promise<void> {
    console.info('High demand Crypto on');
    for (const h of highDemandCryptoCurrencies) {
        console.log(h);
        const pair = new OrderBookUseCases();
        await pair.subscribe(h);
    }
    console.info('High demand Crypto finished');
}
