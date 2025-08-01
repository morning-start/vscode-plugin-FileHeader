// console.log('debug','update',msg);

export class Logger {
    static debug(message: string, ...args: any[]): void {
        console.log('debug', message, ...args);
    }
    static info(message: string, ...args: any[]): void {
        console.log('info', message, ...args);
    }
    static warn(message: string, ...args: any[]): void {
        console.log('warn', message, ...args);
    }
    static error(message: string, ...args: any[]): void {
        console.log('error', message, ...args);
    }

}
