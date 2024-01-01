import { PrismaClient, User } from '@prisma/client'

export const prisma = new PrismaClient({
    log: [
        {
            emit: 'stdout',
            level: 'query',
        },
        {
            emit: 'stdout',
            level: 'error',
        },
        {
            emit: 'stdout',
            level: 'info',
        },
        {
            emit: 'stdout',
            level: 'warn',
        },
    ],
})

interface UserAuthInterface {
    id: () => number
    hasRole: (...roles: string[]) => boolean
}

export class UserAuth implements UserAuthInterface {
    user: User
    constructor(user: User) {
        this.user = user
    }

    id(): number {
        return this.user.id
    }

    hasRole(...roles: string[]): boolean {
        return roles.includes(this.user.role ?? '')
    }
}
