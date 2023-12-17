import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
const prisma = new PrismaClient()

async function main() {
    const admin = await prisma.user.upsert({
        where: { email: 'admin@mail.com' },
        update: {},
        create: {
            email: 'admin@mail.com',
            name: 'Keroro Gunsou',
            password: await bcrypt.hash('admin123', await bcrypt.genSalt()),
            role: 'admin',
            posts: {
                create: {
                    title: 'Check out Prisma with Next.js',
                    content: 'https://www.prisma.io/nextjs',
                    status: 'publish',
                },
            },
        },
    })
    const member = await prisma.user.upsert({
        where: { email: 'member@mail.com' },
        update: {},
        create: {
            email: 'member@mail.com',
            name: 'User Member',
            password: await bcrypt.hash('admin123', await bcrypt.genSalt()),
            role: 'member',
            posts: {
                create: [
                    {
                        title: 'Follow Prisma on Twitter',
                        content: 'https://twitter.com/prisma',
                        status: 'publish',
                    },
                    {
                        title: 'Follow Nexus on Twitter',
                        content: 'https://twitter.com/nexusgql',
                        status: 'publish',
                    },
                ],
            },
        },
    })
    console.log({ admin, member })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
