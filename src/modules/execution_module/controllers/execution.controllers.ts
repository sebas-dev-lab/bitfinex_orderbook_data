/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, Request } from 'express';
import ExecutionModuleService from '../services/execution.services';

export default class ExecutionModuleController {
    private _executionService = new ExecutionModuleService();
    constructor() {
        this.execOrder = this.execOrder.bind(this);
    }
    public async execOrder(req: Request, res: Response): Promise<Response> {
        try {
            const body = req.body;
            const params = req.params.pair;
            const data = await this._executionService.getEffectivePriceService(
                params,
                body.operation,
                body.amount
            );
            return res.status(200).json({
                message: 'Ok',
                data
            });
        } catch (e: any) {
            throw new Error(e.message);
        }
    }
}
