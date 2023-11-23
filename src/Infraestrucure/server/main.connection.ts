import StatusServerConfig from '../../common/configs/status.config';
import { MainConnectionInterface } from './interfaces/connectiosn.interface';

class Connections {
    private toConnect: Array<MainConnectionInterface>;

    constructor(connections: Array<MainConnectionInterface>) {
        this.toConnect = connections;
    }

    async init(): Promise<void> {
        const health = StatusServerConfig.getInstance();
        health.setStatus('Starting');
        for (const conn of this.toConnect) {
            await conn.main_start();
        }
    }
}

export default Connections;
