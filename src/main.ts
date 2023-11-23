import runTest from './test_newman/index.newman';
import Connections from './Infraestrucure/server/main.connection';
import ratherLabsServer from './Infraestrucure/server/ratherlabs.app.server';
//import monitorHardware from './common/statics/hardware.statics';



// ============== Set a conection ================= //
export const connection = new Connections([ratherLabsServer]);

connection.init();

// ======== RUN TEST WHEN INIT APP ============ //
/**
 *  You must see console test and you can see html report on test_newman/reports.html
 *  or go to http://localhost:<port>/api/test_view
 */
// Llamar a la función runTest
runTest().catch((error) => {
    console.error('Error:', error);
});