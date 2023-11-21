import { Express } from 'express';
import { HttpRoutesInterface } from './routes.interfaces';

export interface ConfigConnectionInterface {
  routes: HttpRoutesInterface;
  path: string;
  middlewares?: () => void; // Haciendo middlewares opcional
}

export interface HttpConnectionInterface extends ConfigConnectionInterface {
  get_server(): Express;
  start(port: number): void;
}

