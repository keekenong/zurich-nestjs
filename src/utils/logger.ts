import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
@Injectable()
export class CustomLogger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = createLogger({
      level: 'debug',
      format: format.combine(
        format.timestamp(),
        format.printf(({ level, message, timestamp, stack, context }) => {
          const levelColor = this.getColorForLevel(level);
          const levelText = `[${level}]`;
          return `${timestamp} ${levelColor(levelText)} ${context ?? ''}: ${message} ${stack ? `\n${stack}` : ''}`;
        }),
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.errors({ stack: true }),
            format.colorize(),
            format.printf(({ level, message, timestamp, stack, context }) => {
              const levelColor = this.getColorForLevel(level);
              const levelText = `[${level}]`;
              return stack
                ? `${timestamp} ${levelColor(levelText)} ${context ?? ''}: ${message} \n${stack}`
                : `${timestamp} ${levelColor(levelText)} ${context ?? ''}: ${message}`;
            }),
          ),
        }),
        new transports.DailyRotateFile({
          filename: 'logs/%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }
  log(message: any, ...optionalParams: any[]) {
    this.logger.info(
      this.formatMessge(message),
      { context: this.getContext() },
      ...optionalParams,
    );
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(
      this.formatMessge(message),
      { context: this.getContext() },
      ...optionalParams,
    );
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(
      this.formatMessge(message),
      { context: this.getContext() },
      ...optionalParams,
    );
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(
      this.formatMessge(message),
      { context: this.getContext() },
      ...optionalParams,
    );
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger.verbose(
      this.formatMessge(message),
      { context: this.getContext() },
      ...optionalParams,
    );
  }

  custom(level: string, message: any, ...optionalParams: any[]) {
    this.logger.log(
      level,
      this.formatMessge(message),
      { context: this.getContext() },
      ...optionalParams,
    );
  }

  private formatMessge(message: any): string {
    if (message instanceof Error) {
      return message.stack || message.message;
    }
    if (typeof message === 'object') {
      return JSON.stringify(message);
    }
    return message;
  }
  // Setup ANSI color escape sequences for different log levels
  private getColorForLevel(level: string) {
    switch (level) {
      case 'error':
        return (text) => `\x1b[31m${text}\x1b[0m`;
      case 'warn':
        return (text) => `\x1b[33m${text}\x1b[0m`;
      case 'debug':
        return (text) => `\x1b[32m${text}\x1b[0m`;
      case 'verbose':
        return (text) => `\x1b[36m${text}\x1b[0m`;
      default:
        return (text) => `\x1b[37m${text}\x1b[0m`;
    }
  }

  private getContext(): string | undefined {
    const stack = new Error().stack;
    if (stack) {
      const stackLines = stack.split('\n');
      const callerLine = stackLines[3];
      const matches = callerLine.match(/\((.*?)\)/);
      if (matches) {
        const className = matches[1].split('/').pop();
        return className;
      }
    }
    return undefined;
  }
}
