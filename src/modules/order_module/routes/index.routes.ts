import express, { Router } from 'express';
import { exceptionHanddler } from '../../../Infraestrucure/server/exceptions/http.error.exceptions';
import OrderModuleControllers from '../controllers/orderModule.controllers';

export default function orderModuleRoutes(): Router {
    const router: Router = express.Router();
    const orderModuleControllers = new OrderModuleControllers();
    router.get('/tips/:pair', exceptionHanddler(orderModuleControllers.getOrderBookTips));

    return router;
}