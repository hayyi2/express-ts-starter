import { Router } from 'express'
import { catchError } from 'utils/errors'
import { hasAuthed } from 'modules/auth/auth.middleware'
import { createNote, deleteNote, getNote, getsNote, updateNote } from './note.controller'
import { noteMiddleware } from './note.middleware'

export const noteRoutes = Router()
noteRoutes.use(hasAuthed)

noteRoutes.get('/', catchError(getsNote))
noteRoutes.get('/:id', noteMiddleware, catchError(getNote))
noteRoutes.post('/', catchError(createNote))
noteRoutes.put('/:id', noteMiddleware, catchError(updateNote))
noteRoutes.delete('/:id', noteMiddleware, catchError(deleteNote))
