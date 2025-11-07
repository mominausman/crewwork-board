import { z } from "zod";

// Auth validation schemas
export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password must be less than 128 characters" }),
  role: z.enum(["admin", "manager", "member"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(128, { message: "Password must be less than 128 characters" }),
});

// Task validation schemas
export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(200, { message: "Title must be less than 200 characters" }),
  description: z
    .string()
    .trim()
    .max(2000, { message: "Description must be less than 2000 characters" })
    .optional()
    .nullable(),
  assigned_to: z
    .string()
    .uuid({ message: "Please select a valid user" }),
  deadline: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Please select a valid date",
    })
    .refine((date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "Deadline cannot be in the past",
    }),
  status: z.enum(["pending", "in-progress", "completed"]),
  priority: z.enum(["high", "medium", "low"]),
});

// Comment validation schema
export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "Comment cannot be empty" })
    .max(1000, { message: "Comment must be less than 1000 characters" }),
});

// User profile validation schema
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
