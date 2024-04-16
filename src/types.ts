import { User } from '@prisma/client'
import { Request } from 'express'

export interface AppRequest extends Request {
    userAuth?: User
}
