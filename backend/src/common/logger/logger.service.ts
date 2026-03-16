import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

/**
 * Custom logger service for NestJS backend
 * Replaces console.log/warn/error with structured logging
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';
    return `[${timestamp}] [${level}] [${ctx}] ${message}`;
  }

  log(message: any, context?: string) {
    console.log(this.formatMessage('INFO', message, context));
  }

  error(message: any, trace?: string, context?: string) {
    console.error(this.formatMessage('ERROR', message, context));
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: any, context?: string) {
    console.warn(this.formatMessage('WARN', message, context));
  }

  debug(message: any, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  verbose(message: any, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('VERBOSE', message, context));
    }
  }

  // Helper methods for common logging patterns
  logSuccess(message: string, context?: string) {
    this.log(`✅ ${message}`, context);
  }

  logWarning(message: string, context?: string) {
    this.warn(`⚠️  ${message}`, context);
  }

  logError(message: string, error?: Error, context?: string) {
    this.error(`❌ ${message}`, error?.stack, context);
  }

  logInfo(message: string, context?: string) {
    this.log(`ℹ️  ${message}`, context);
  }
}
