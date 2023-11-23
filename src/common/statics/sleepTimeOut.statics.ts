import Logger from '../configs/winston.logs';

export default function sleepTimeOut(ms: number): Promise<void> {
    console.info('Waiting 10 seconds');
    return new Promise((resolve) => {
        setTimeout(() => {
            Logger.info('Continuing after waiting.');
            resolve();
        }, ms);
    });
}
