import highDemandCryptoCurrenciesFn from '../../modules/data_dump/highDemand.data_dump';
import { MainConnectionAbstract } from './abstracts/main.abstrats';
import { WsConnectionAbstract } from './abstracts/ws.abstracts';
import { RatherLabsConfigConnection } from './apps/ratherlabs/main.config';
import { RatherLabsAppHttpConnection } from './apps/ratherlabs/main.http';
import { RatherLabsHttpRoutes } from './apps/ratherlabs/main.routes';
import { connEnvs } from './envs/envs';
import { MainConnectionInterface } from './interfaces/connectiosn.interface';

class RatherLabsAppMainConnection extends MainConnectionAbstract {}

const ratherLabsServer: MainConnectionInterface = new RatherLabsAppMainConnection({
    port: Number(connEnvs.server_port),
    http: new RatherLabsAppHttpConnection(
        new RatherLabsConfigConnection(new RatherLabsHttpRoutes(), '/api')
    ),
    ws: new WsConnectionAbstract(),
    ws_options: {
        path: '/api/gateway'
    }
});
export default ratherLabsServer;




// ----- bulkdata ----- //
highDemandCryptoCurrenciesFn().then(()=> console.info('Connection with some cryptocurrencies established correctly')).catch((e) =>  console.error(e));