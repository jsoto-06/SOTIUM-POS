export interface Logger {
  info(message: string, ...meta: any[]): void;
  warn(message: string, ...meta: any[]): void;
  error(message: string, ...meta: any[]): void;
  debug(message: string, ...meta: any[]): void;
}

class ConsoleLogger implements Logger {
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  }

  info(message: string, ...meta: any[]): void {
    console.info(this.formatMessage('info', message), ...meta);
  }

  warn(message: string, ...meta: any[]): void {
    console.warn(this.formatMessage('warn', message), ...meta);
  }

  error(message: string, ...meta: any[]): void {
    console.error(this.formatMessage('error', message), ...meta);
  }

  debug(message: string, ...meta: any[]): void {
    console.debug(this.formatMessage('debug', message), ...meta);
  }
}

export const logger: Logger = new ConsoleLogger();
