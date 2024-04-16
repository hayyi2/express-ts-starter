import multer from 'multer'
import { BaseError } from './errors'
import { v4 } from 'uuid'

export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/')
    },
    filename: (req, file, cb) => {
        const fileTemp = file.originalname.split('.')
        cb(null, Date.now() + '-' + v4() + '.' + fileTemp[fileTemp.length - 1])
    },
})

export const imageMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

// Create the multer instance
export const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!imageMimes.includes(file.mimetype)) {
            return cb(new BaseError('File is not allowed', 400))
        }

        cb(null, true)
    },
})
