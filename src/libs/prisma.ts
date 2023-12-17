import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
    log: [
        {
            emit: 'stdout',
            level: 'query',
        },
        // {
        //     emit: 'stdout',
        //     level: 'error',
        // },
        // {
        //     emit: 'stdout',
        //     level: 'info',
        // },
        // {
        //     emit: 'stdout',
        //     level: 'warn',
        // },
    ],
})
prisma.$extends({
    result: {
        user: {
            hasRole: {
                needs: { role: true },
                compute(user) {
                    return (...roles: string[]) => roles.includes(user.role ?? '')
                },
            },
        },
    },
})
