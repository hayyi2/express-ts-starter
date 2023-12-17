import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { logger } from './libs/logger'

export class BaseError extends Error {
    status: number
    isOperational: boolean
    constructor(message: string, status: number, isOperational = true) {
        super(message)
        this.status = status
        this.isOperational = isOperational
        Object.setPrototypeOf(this, BaseError.prototype)
    }
}

export class NotFoundError extends BaseError {
    constructor(message: string) {
        super(message, 404)
        Object.setPrototypeOf(this, NotFoundError.prototype)
    }
}

export class ValidationError extends BaseError {
    errorData: ZodError
    constructor(data: ZodError) {
        super('Validation Error', 400)
        this.errorData = data
        Object.setPrototypeOf(this, ValidationError.prototype)
    }
}

// not found handler middleware
export const notFoundHandler = (req: Request) => {
    throw new NotFoundError(`Cannot ${req.method} ${req.path}`)
}

// error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ValidationError) {
        return res.status(err.status).json({
            status: 'fail',
            message: err.message,
            data: err.errorData.issues.map(({ path, message }) => ({ path, message })),
        })
    } else if (err instanceof BaseError) {
        if (err.isOperational) {
            return res.status(err.status).json({
                status: err.status < 500 && err.status >= 400 ? 'fail' : 'error',
                message: err.message,
            })
        } else {
            return res.status(err.status).json({
                status: 'error',
                message: 'Something went wrong',
            })
        }
    } else if (err instanceof Error) {
        logger.error(err.name, err)
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong',
        })
    } else {
        return next()
    }
}
