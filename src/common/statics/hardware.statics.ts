import * as os from 'os';

export default function monitorHardware(): void {
    const cpuUsage = os.cpus();
    console.log('CPU Usage:', cpuUsage);

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    console.log(`Total Memory: ${totalMemory} bytes`);
    console.log(`Free Memory: ${freeMemory} bytes`);

    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    console.log(`Memory Usage: ${memoryUsagePercent.toFixed(2)}%`);

    setImmediate(monitorHardware);
}

