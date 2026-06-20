import { z } from 'zod';

export const SignupSchema = z.object({
  username: z.string(),
  password: z.string().min(6).max(35),
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string().min(6).max(35),
});

export const orgnaizationSchema = z.object({
  title: z.string().max(100),
  description: z.string(),
});

export const boardSchema = z.object({
  title: z.string().max(100),
  description: z.string(),
});

export const issueSchema = z.object({
  title: z.string().max(100),
  description: z.string(),
  boardId: z.string(),
  assignedTo: z.string(),
});
