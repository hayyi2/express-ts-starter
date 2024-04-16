import { catchError } from 'utils/errors'
import { Router } from 'express'
import { hasAuthed } from 'modules/auth/auth.middleware'
import { getProfile, updatePhoto, updateProfile } from './profile.controller'
import { uploadPhoto } from './profile.middleware'

export const profileRoutes = Router()
profileRoutes.use('/', hasAuthed)

profileRoutes.get('/', catchError(getProfile))
profileRoutes.put('/', catchError(updateProfile))
profileRoutes.put('/photo', uploadPhoto, catchError(updatePhoto))
