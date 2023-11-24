import newman from 'newman'; // require Newman in your project
import * as path from 'path';
import Logger from '../common/configs/winston.logs';
import { connEnvs } from '../Infraestrucure/server/envs/envs';
import sleepTimeOut from '../common/statics/sleepTimeOut.statics';
import StatusServerConfig from '../common/configs/status.config';

export default async function runTest() {
    // Wait 10 seconds before starting
    await sleepTimeOut(10000);

    // Test Configurations
    const newmanOptions = {
        collection: require('./test_case_postman.json'),
        reporters: ['cli', 'htmlextra'],
        reporter: {
            htmlextra: {
                export: path.join(__dirname, './report.html'),
                logs: true,
                browserTitle: 'Testing report',
                title: 'Testing Challenge',
                showEnvironmentData: true,
            }
        }
    };
    const health = StatusServerConfig.getInstance();
    health.setStatus('Ok');

    // Run newman
    newman.run(newmanOptions, function (err) {
        if (err) {
            Logger.error('Error in collection run: ', err);
            health.setStatus('Error');
            throw err;
        }
        Logger.info(`Testing completed. You can see the report in: http://localhost:${connEnvs.server_port}/api/test_view`);
    });
}