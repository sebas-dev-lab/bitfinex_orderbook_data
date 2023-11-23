/* eslint-disable @typescript-eslint/no-empty-function */
export default class StatusServerConfig {
    private static instance: StatusServerConfig | null = null;
    private status: 'Starting' | 'Error' | 'Ok' | 'Unknow' = 'Unknow';
    private constructor(){}
    public static getInstance(): StatusServerConfig {
        if (!StatusServerConfig.instance) {
            StatusServerConfig.instance = new StatusServerConfig();
        }
        return StatusServerConfig.instance;
    }
    getStatus(): string {
        return this.status;
    }
    setStatus(status: 'Starting' | 'Error' | 'Ok'): void {
        this.status = status;
    }
}