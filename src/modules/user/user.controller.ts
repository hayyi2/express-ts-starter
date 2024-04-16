import { Request, Response } from 'express'
import { prisma } from 'utils/prisma'
import { userCollection } from './user.collection'
import { UserRequest } from './user.middleware'
import { User } from '@prisma/client'
import { UserCreateSchema, UserUpdateSchema } from './user.shcema'
import bcrypt from 'bcrypt'

export const getsUser = async (req: Request, res: Response) => {
    return res.json((await prisma.user.findMany()).map(userCollection))
}

export const getUser = async (req: UserRequest, res: Response) => {
    return res.json(userCollection(req.user as User))
}

export const createUser = async (req: Request, res: Response) => {
    const userCreateData = await UserCreateSchema.parseAsync(req.body)
    const user = await prisma.user.create({
        data: {
            name: userCreateData.name,
            email: userCreateData.email,
            password: bcrypt.hashSync(userCreateData.password, bcrypt.genSaltSync()),
            role: userCreateData.role,
        },
    })
    return res.status(201).json(userCollection(user))
}

export const updateUser = async (req: UserRequest, res: Response) => {
    const userUpdateData = await UserUpdateSchema(req.user?.email ?? '').parseAsync(req.body)
    const password = bcrypt.hashSync(userUpdateData.password ?? '', bcrypt.genSaltSync())
    const user = await prisma.user.update({
        where: { id: req.user?.id },
        data: {
            name: userUpdateData.name,
            email: userUpdateData.email,
            role: userUpdateData.role,
            ...(userUpdateData.password ? { password } : {}),
        },
    })
    return res.json(userCollection(user))
}

export const deleteUser = async (req: UserRequest, res: Response) => {
    await prisma.user.delete({
        where: { id: req.user?.id },
    })
    return res.status(204).json({})
}
