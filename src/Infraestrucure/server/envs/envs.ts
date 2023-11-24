import { enviroments } from './envs.config';

enviroments;

export const connEnvs = {
    // ============ server envs =========== //
    server_port: process.env.PORT
};

export const authEnvs = {
    // ============ auth envs =========== //
    auth_secret: process.env.AUTH_SECRET ? String(process.env.AUTH_SECRET) : 'secret'
};

export const redisEnvs = {
    // ============ redis envs =========== //
    redis_port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6378,
    redis_host: process.env.REDIS_HOST,
};

export const bitfinexEnvs = {
    // ============ redis envs =========== //
    btfx_ws: process.env.MARKET_BITFINEX_WS,
    btfx_ep: process.env.MARKET_BITFINEX_HTTP,
};