import { Response } from 'express'
import { AppRequest } from 'types'
import { ChangePasswordSchema, ChangeProfileSchema } from './profile.schema'
import { prisma } from 'utils/prisma'
import { BaseError } from 'utils/errors'
import bcrypt from 'bcrypt'
import fs from 'fs'
import { getUserAuth } from 'modules/auth/auth.middleware'

export const getProfile = async (req: AppRequest, res: Response) => {
    const { name, email, photo, role } = getUserAuth(req)
    return res.json({ name, email, photo, role })
}

export const updateProfile = async (req: AppRequest, res: Response) => {
    const userAuth = getUserAuth(req)
    const changeProfileData = ChangeProfileSchema.parse(req.body)
    let changePasswordData = {}
    if (req.body.changePassword) {
        const { old, password } = ChangePasswordSchema.parse(req.body)
        if (!bcrypt.compareSync(old, userAuth.password ?? '')) {
            throw new BaseError('Invalid old password', 400)
        }
        changePasswordData = {
            password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
        }
    }
    const user = await prisma.user.update({
        where: { id: userAuth.id },
        data: { ...changeProfileData, ...changePasswordData },
    })

    const { name, email, photo } = user
    return res.json({ name, email, photo })
}

export const updatePhoto = async (req: AppRequest, res: Response) => {
    const userAuth = getUserAuth(req)
    const old_photo = userAuth.photo
    if (old_photo && fs.existsSync('./public/' + old_photo)) {
        fs.unlinkSync('./public/' + old_photo)
    }
    const user = await prisma.user.update({
        where: { id: userAuth.id },
        data: {
            photo: 'uploads/' + req.file?.filename,
        },
    })

    const { name, email, photo } = user
    return res.json({ name, email, photo })
}
