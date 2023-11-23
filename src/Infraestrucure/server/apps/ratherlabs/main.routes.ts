// En RatherLabsHttpRoutes.ts
import express, { Router } from 'express';
import { HttpRoutesInterface } from '../../interfaces/routes.interfaces';
import * as path from 'path';
import modulesRoutes from '../../../../modules/index.modules';

export class RatherLabsHttpRoutes implements HttpRoutesInterface {
    router: Router;

    constructor() {
        this.router = express.Router();
        this.index = this.index.bind(this);
    }

    index(): Router {
        // =========== Modules ========= //
        this.router.use(modulesRoutes()); // Asegúrate de que modulesRoutes() devuelve un Router

        // ========== YOU CAN SEE THE LAST REPORT ON http://localhost:<port>/api/test_view =========== //
        this.router.get('/test_view', function (req, res) {
            res.sendFile(path.join(__dirname, '../../../../test_newman/report.html'));
        });

        return this.router;
    }
}
