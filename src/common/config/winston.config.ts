
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const isProduction = process.env.NODE_ENV === 'production';
const logDir = join(process.cwd(), 'logs');

if (isProduction) {
  mkdirSync(join(logDir, 'app'), { recursive: true });
  mkdirSync(join(logDir, 'error'), { recursive: true });
}

const appOnlyFilter = winston.format((info) => {
  if (info.level === 'error') {
    return false;
  }

  return info;
});

const transports: winston.transport[] = isProduction
  ? [
    new DailyRotateFile({
      dirname: join(logDir, 'app'),
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: 5,
      zippedArchive: true,
      format: appOnlyFilter(),
    }),

    new DailyRotateFile({
      dirname: join(logDir, 'error'),
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: 5,
      zippedArchive: true,
    }),
  ]
  : [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.prettyPrint({ colorize: true }),
      ),
    }),
  ];

export const WinstonConfig: winston.LoggerOptions = {
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports,
};
