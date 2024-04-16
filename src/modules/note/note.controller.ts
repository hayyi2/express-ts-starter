import { AppRequest } from 'types'
import { Response } from 'express'
import { prisma } from 'utils/prisma'
import { NoteSchema } from './note.schema'
import { NoteRequest } from './note.middleware'
import { Note } from '@prisma/client'
import { getUserAuth } from 'modules/auth/auth.middleware'

export const getsNote = async (req: AppRequest, res: Response) => {
    const { id: authorId } = getUserAuth(req)
    const notes = await prisma.note.findMany({ where: { authorId } })
    return res.json(notes)
}

export const getNote = async (req: NoteRequest, res: Response) => {
    return res.json(req.note as Note)
}

export const createNote = async (req: AppRequest, res: Response) => {
    const { id: authorId } = getUserAuth(req)
    const noteData = NoteSchema.parse(req.body)
    const note = await prisma.note.create({
        data: { ...noteData, authorId },
    })
    return res.status(201).json(note)
}

export const updateNote = async (req: NoteRequest, res: Response) => {
    const noteData = NoteSchema.parse(req.body)
    const note = await prisma.note.update({
        where: { id: req.note?.id },
        data: noteData,
    })

    return res.json(note)
}
export const deleteNote = async (req: NoteRequest, res: Response) => {
    await prisma.note.delete({
        where: { id: req.note?.id },
    })
    return res.status(204).json({})
}
