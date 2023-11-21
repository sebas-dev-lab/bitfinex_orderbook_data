import express, { Router } from 'express';
import { exceptionHanddler } from '../../../Infraestrucure/server/exceptions/http.error.exceptions';
import ExecutionModuleController from '../controllers/execution.controllers';

export default function executionModuleRoutes(): Router {
    const router: Router = express.Router();
    const executionModuleControllers = new ExecutionModuleController();
    router.post('/effectivePrice/:pair', exceptionHanddler(executionModuleControllers.execOrder));

    return router;
}