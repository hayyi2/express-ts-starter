import { Request } from 'express'
import { UserAuth } from './libs/prisma'

export interface AppRequest extends Request {
    auth?: UserAuth | null
}
