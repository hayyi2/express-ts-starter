import { NextFunction, Response, Router } from 'express'
import { z } from 'zod'
import { prisma } from '../libs/prisma'
import { BaseError, NotFoundError, ValidationError } from '../errors'
import { authMiddleware } from './auth'
import { UserRole } from './user'
import { Post } from '@prisma/client'
import { AppRequest } from '../types'

export const postRoutes = Router()

export enum PostStatus {
    DRAFT = 'draft',
    UNLISTED = 'unlisted',
    PUBLISH = 'publish',
}

const PostSchema = z.object({
    title: z
        .string({
            invalid_type_error: 'Title invalid value',
            required_error: 'Title required',
        })
        .trim(),
    content: z
        .string({
            invalid_type_error: 'Content invalid value',
            required_error: 'Content required',
        })
        .trim(),
    status: z.nativeEnum(PostStatus, {
        errorMap: () => {
            return { message: 'Status invalid value' }
        },
    }),
})

const includeAuthor = {
    author: {
        select: {
            name: true,
            email: true,
            photo: true,
        },
    },
}

postRoutes.use(authMiddleware)

postRoutes
    .route('/')
    .get(async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            const availableWhere = {
                where: {
                    status: PostStatus.PUBLISH,
                    OR: [{ authorId: req.auth?.id() }],
                },
            }
            const isAdmin = req.auth?.hasRole(UserRole.ADMIN.toString())
            const whereQuery = isAdmin ? {} : availableWhere
            const posts = await prisma.post.findMany({
                ...whereQuery,
                include: includeAuthor,
            })
            return res.json(posts)
        } catch (error) {
            next(error)
        }
    })
    .post(async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            const postValidate = PostSchema.safeParse(req.body)
            if (!postValidate.success) {
                throw new ValidationError(postValidate.error)
            }
            const postData = {
                ...postValidate.data,
                authorId: req.auth?.id() ?? 0,
            }

            const post = await prisma.post.create({
                data: postData,
                include: includeAuthor,
            })
            return res.status(201).json(post)
        } catch (error) {
            next(error)
        }
    })

type AuthorType = {
    name: string
    email: string
    photo: string
}

export interface PostRequest extends AppRequest {
    post?: (Post & { author: AuthorType }) | null
}

const postMiddleware = async (req: PostRequest, res: Response, next: NextFunction) => {
    try {
        const post = await prisma.post.findFirst({
            where: { id: parseInt(req.params.id) },
            include: includeAuthor,
        })
        if (post === null) {
            throw new NotFoundError('Post not found')
        }
        req.post = post
    } catch (error) {
        next(error)
    }

    return next()
}

const availablePostMiddleware = (req: PostRequest, res: Response, next: NextFunction) => {
    if (req.auth?.hasRole(UserRole.ADMIN)) {
        return next()
    }
    const available = [PostStatus.PUBLISH.toString(), PostStatus.UNLISTED.toString()].includes(req.post?.status ?? '')
    if (!(available || req.post?.authorId === req.auth?.id())) {
        throw new NotFoundError('Post not found')
    }
    return next()
}

const selfPostMiddleware = (req: PostRequest, res: Response, next: NextFunction) => {
    if (req.auth?.hasRole(UserRole.ADMIN)) {
        return next()
    }
    if (req.post?.authorId !== req.auth?.id()) {
        throw new BaseError('Forbidden', 403)
    }
    return next()
}

postRoutes
    .route('/:id')
    .get(postMiddleware, availablePostMiddleware, async (req: PostRequest, res: Response, next: NextFunction) => {
        try {
            return res.json(req.post as Post)
        } catch (error) {
            next(error)
        }
    })
    .put(postMiddleware, selfPostMiddleware, async (req: PostRequest, res: Response, next: NextFunction) => {
        try {
            const postValidate = PostSchema.safeParse(req.body)
            if (!postValidate.success) {
                throw new ValidationError(postValidate.error)
            }
            const postData = postValidate.data

            const post = await prisma.user.update({
                where: { id: req.post?.id },
                data: postData,
            })

            return res.json(post)
        } catch (error) {
            next(error)
        }
    })
    .delete(postMiddleware, selfPostMiddleware, async (req: PostRequest, res: Response, next: NextFunction) => {
        try {
            await prisma.post.delete({
                where: { id: req.post?.id },
            })
            return res.status(204).json({})
        } catch (error) {
            next(error)
        }
    })
