/* eslint-disable @typescript-eslint/ban-types */
import Redis, { RedisOptions } from 'ioredis';

export function RedisConnection(options: RedisOptions) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            redisClient = new Redis(options);
            redisSubscriber = new Redis(options);
            redisPublisher = new Redis(options);
        };
    };
}
