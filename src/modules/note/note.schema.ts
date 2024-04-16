import { z } from 'zod'

export const NoteSchema = z.object({
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
})
