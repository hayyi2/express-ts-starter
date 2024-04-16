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
            notes: {
                create: {
                    title: 'Sample Note',
                    content: 'Content sample note',
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
            notes: {
                create: [
                    {
                        title: 'First Note',
                        content: 'Content first note',
                    },
                    {
                        title: 'Second Note',
                        content: 'Content second note',
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
