import { Note } from '@prisma/client'
import { NotFoundError } from 'utils/errors'
import { NextFunction, Response } from 'express'
import { prisma } from 'utils/prisma'
import { AppRequest } from 'types'
import { getUserAuth } from 'modules/auth/auth.middleware'

export interface NoteRequest extends AppRequest {
    note?: Note
}

export const noteMiddleware = async (req: NoteRequest, res: Response, next: NextFunction) => {
    try {
        const { id: authorId } = getUserAuth(req)
        const note = await prisma.note.findFirst({
            where: { id: req.params.id, authorId },
        })
        if (note === null) {
            throw new NotFoundError('Note not found')
        }
        req.note = note
    } catch (error) {
        next(error)
    }
    return next()
}
