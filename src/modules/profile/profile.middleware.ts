import { BaseError } from 'utils/errors'
import multer from 'multer'
import { imageMimes, storage } from 'utils/multer'

export const uploadPhoto = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const fileSize = parseInt(req.headers['content-length'] ?? '')
        if (!imageMimes.includes(file.mimetype)) {
            return cb(new BaseError('File is not allowed', 400))
        }
        if (fileSize > 1048576 * 5) {
            return cb(new BaseError('File is too large', 400))
        }

        cb(null, true)
    },
}).single('photo')
