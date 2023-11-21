import express, { Express, NextFunction, Request, Response, Router } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import compress from 'compression';
import morganMiddleware from '../../../common/configs/morgan.logs';
import Logger from '../../../common/configs/winston.logs';
import { ConfigConnectionInterface, HttpConnectionInterface } from '../interfaces/http.interfaces';
import { HttpRoutesInterface } from '../interfaces/routes.interfaces';

export abstract class HttpConnection implements HttpConnectionInterface {
    private server: Express;
    private callback?: (n?: unknown) => void;
    routes: HttpRoutesInterface;
    path: string;
    configMiddlewares: (() => void) | undefined;

    constructor(configs: ConfigConnectionInterface, cb?: (n?: unknown) => void) {
        this.server = express();
        this.routes = configs.routes;
        this.path = configs.path;
        this.configMiddlewares = configs.middlewares;
        this.callback = cb;
    }

    middlewares(): void {
        this.server.use(express.json());
        this.server.use(express.urlencoded({ extended: true }));
        this.server.use(morgan('dev'));
        this.server.use(helmet.xssFilter());
        this.server.use(helmet.noSniff());
        this.server.use(helmet.hidePoweredBy());
        this.server.use(helmet.frameguard({ action: 'deny' }));
        this.server.use(compress());
        this.server.use(morganMiddleware);
        if (this.configMiddlewares) this.configMiddlewares();
    }

    executions(): void {
        if (this.callback) this.callback();

        // ================== GENERIC ROUTES ================= //
        this.server.use(this.path, this.routes.index());

        // ================== ERROR HANDLER ================= //
        this.server.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.log(err);
            res.status(409).send(err.message);
        });
    }

    get_server(): Express {
        this.middlewares();
        this.executions();

        return this.server;
    }

    start(port: number): void {
        this.middlewares();
        this.executions();

        this.server.listen(port, () => {
            Logger.info(`Server on port: ${port}`);
        });
    }
}
