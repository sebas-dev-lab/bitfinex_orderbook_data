/* eslint-disable @typescript-eslint/ban-types */
import WebSocket from 'ws';

export function WebSocketConnection(uri: string | undefined) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            ws = uri ? new WebSocket(uri) : null;
        };
    };
}
