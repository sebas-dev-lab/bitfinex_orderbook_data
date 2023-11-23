import express, { Router } from 'express';
import HealthCheckControllers from './healthCheck.controllers';
import { exceptionHanddler } from '../../Infraestrucure/server/exceptions/http.error.exceptions';

export default function healthCheckRoutes(): Router {
    const router: Router = express.Router();
    const healthCheckControllers = new HealthCheckControllers();
    router.get('/', exceptionHanddler(healthCheckControllers.healthCheck));

    return router;
}