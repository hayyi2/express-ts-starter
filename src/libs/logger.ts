import DailyRotateFile from 'winston-daily-rotate-file'
import winston from 'winston'

const fileTransport = new DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7d',
})

const consoleTransport = new winston.transports.Console()

export const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.errors(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            return `[${timestamp}] ${level}: ${message}\n${stack}`
        }),
    ),
    transports: [fileTransport, consoleTransport],
})
