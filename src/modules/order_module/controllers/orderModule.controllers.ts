/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, Request } from 'express';
import OrderBookServices from '../services/orderbook.services';

export default class OrderModuleControllers {
    private _orderService = new OrderBookServices();
    constructor(){
        this.getOrderBookTips = this.getOrderBookTips.bind(this);
    }
    public async getOrderBookTips(req: Request, res: Response): Promise<Response> {
        try {
            const data = await this._orderService.getOrderBookTips(req.params?.pair.trim().toUpperCase());
            return res.status(200).json({
                message: 'Ok',
                data,
            });
        } catch(e: any) {
            throw new Error(e.message);
        }
    }
}
