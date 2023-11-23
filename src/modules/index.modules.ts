import express, { Router } from 'express';
import orderModuleRoutes from './order_module/routes/index.routes';
import executionModuleRoutes from './execution_module/routes/execution.routes';
import healthCheckRoutes from './check/healthCheck.routes';

export default function modulesRoutes(): Router {
    const router: Router = express.Router();

    //--- health check --- //
    router.use('/health/check', healthCheckRoutes());
    
    //--- orderbook --- //
    router.use('/orderbook', orderModuleRoutes());
    
    //--- executions --- //
    router.use('/execution', executionModuleRoutes());

    return router;
}