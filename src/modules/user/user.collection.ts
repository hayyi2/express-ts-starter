import { User } from '@prisma/client'

export const userCollection = ({ id, name, email, photo, enable, role, createdAt, updatedAt }: User) => ({
    id,
    name,
    email,
    photo,
    enable,
    role,
    createdAt,
    updatedAt,
})
