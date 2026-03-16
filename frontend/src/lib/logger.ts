/**
 * Centralized logging utility
 * Replaces console.log/warn/error with environment-aware logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
    enabled: boolean;
    level: LogLevel;
    prefix?: string;
}

class Logger {
    private config: LoggerConfig;

    constructor(config?: Partial<LoggerConfig>) {
        this.config = {
            enabled: process.env.NODE_ENV === 'development',
            level: 'info',
            prefix: '[App]',
            ...config
        };
    }

    private shouldLog(level: LogLevel): boolean {
        if (!this.config.enabled) return false;

        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.config.level);
        const requestedLevelIndex = levels.indexOf(level);

        return requestedLevelIndex >= currentLevelIndex;
    }

    private formatMessage(level: LogLevel, message: string, ...args: any[]): any[] {
        const timestamp = new Date().toISOString();
        const prefix = this.config.prefix || '';
        return [`[${timestamp}] ${prefix} [${level.toUpperCase()}]`, message, ...args];
    }

    debug(message: string, ...args: any[]): void {
        if (this.shouldLog('debug')) {
            console.log(...this.formatMessage('debug', message, ...args));
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.shouldLog('info')) {
            console.info(...this.formatMessage('info', message, ...args));
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.shouldLog('warn')) {
            console.warn(...this.formatMessage('warn', message, ...args));
        }
    }

    error(message: string, error?: Error | any, ...args: any[]): void {
        if (this.shouldLog('error')) {
            console.error(...this.formatMessage('error', message, error, ...args));
            
            // In production, you could send to error tracking service here
            // e.g., Sentry, LogRocket, etc.
            if (process.env.NODE_ENV === 'production' && error) {
                // TODO: Send to error tracking service
            }
        }
    }

    // Create a child logger with a specific prefix
    child(prefix: string): Logger {
        return new Logger({
            ...this.config,
            prefix: `${this.config.prefix} ${prefix}`
        });
    }
}

// Default logger instance
export const logger = new Logger();

// Specialized loggers for different parts of the app
export const apiLogger = logger.child('[API]');
export const authLogger = logger.child('[Auth]');
export const storageLogger = logger.child('[Storage]');
export const hookLogger = logger.child('[Hook]');

// Export Logger class for custom instances
export { Logger };
