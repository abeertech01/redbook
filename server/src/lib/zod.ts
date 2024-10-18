import { z } from "zod"

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(60, "Name must not exceed 60 characters"),

  username: z
    .string()
    .min(2, "Username must be at least 2 characters long")
    .max(60, "Username must not exceed 60 characters"),

  email: z.string().email("Please provide a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(60, "Password must not exceed 60 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[@$!%*?&]/,
      "Password must contain at least one special character (e.g., @$!%*?&)"
    ),
})

export type RegisterSchemaType = z.infer<typeof registerSchema>
