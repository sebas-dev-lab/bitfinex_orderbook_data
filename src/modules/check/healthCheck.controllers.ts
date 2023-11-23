import { Response, Request } from 'express';
import StatusServerConfig from '../../common/configs/status.config';

export default class HealthCheckControllers {
    constructor() {
        this.healthCheck = this.healthCheck.bind(this);
    }

    public async healthCheck(req: Request, res: Response): Promise<Response> {
        const health = StatusServerConfig.getInstance();
        return res.status(200).json({
            message: health.getStatus(),
        });
    }
}
