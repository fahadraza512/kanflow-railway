import { z } from 'zod';
import { VALIDATION_CONFIG } from '@/config/app.config';

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .max(VALIDATION_CONFIG.EMAIL_MAX_LENGTH, 'Email is too long'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(VALIDATION_CONFIG.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_CONFIG.PASSWORD_MIN_LENGTH} characters`)
        .max(VALIDATION_CONFIG.PASSWORD_MAX_LENGTH, 'Password is too long'),
});

export const registerSchema = z.object({
    firstName: z
        .string()
        .min(VALIDATION_CONFIG.NAME_MIN_LENGTH, `First name must be at least ${VALIDATION_CONFIG.NAME_MIN_LENGTH} characters`)
        .max(VALIDATION_CONFIG.NAME_MAX_LENGTH, 'First name is too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
    lastName: z
        .string()
        .min(VALIDATION_CONFIG.NAME_MIN_LENGTH, `Last name must be at least ${VALIDATION_CONFIG.NAME_MIN_LENGTH} characters`)
        .max(VALIDATION_CONFIG.NAME_MAX_LENGTH, 'Last name is too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .max(VALIDATION_CONFIG.EMAIL_MAX_LENGTH, 'Email is too long'),
    password: z
        .string()
        .min(VALIDATION_CONFIG.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_CONFIG.PASSWORD_MIN_LENGTH} characters`)
        .max(VALIDATION_CONFIG.PASSWORD_MAX_LENGTH, 'Password is too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(VALIDATION_CONFIG.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_CONFIG.PASSWORD_MIN_LENGTH} characters`)
        .max(VALIDATION_CONFIG.PASSWORD_MAX_LENGTH, 'Password is too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .max(VALIDATION_CONFIG.EMAIL_MAX_LENGTH, 'Email is too long'),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
        .string()
        .min(VALIDATION_CONFIG.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_CONFIG.PASSWORD_MIN_LENGTH} characters`)
        .max(VALIDATION_CONFIG.PASSWORD_MAX_LENGTH, 'Password is too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// ============================================
// WORKSPACE SCHEMAS
// ============================================

export const workspaceNameSchema = z
    .string()
    .min(1, 'Workspace name is required')
    .min(VALIDATION_CONFIG.NAME_MIN_LENGTH, `Workspace name must be at least ${VALIDATION_CONFIG.NAME_MIN_LENGTH} characters`)
    .max(VALIDATION_CONFIG.NAME_MAX_LENGTH, 'Workspace name is too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Workspace name can only contain letters, numbers, spaces, hyphens, and underscores');

export const createWorkspaceSchema = z.object({
    name: workspaceNameSchema,
    description: z
        .string()
        .max(VALIDATION_CONFIG.DESCRIPTION_MAX_LENGTH, 'Description is too long')
        .optional(),
    logo: z.string().url('Invalid logo URL').optional(),
    subscription: z.enum(['free', 'pro']).optional(),
});

export const updateWorkspaceSchema = z.object({
    name: workspaceNameSchema.optional(),
    description: z
        .string()
        .max(VALIDATION_CONFIG.DESCRIPTION_MAX_LENGTH, 'Description is too long')
        .optional(),
    icon: z.string().url('Invalid icon URL').optional(),
});

export const addWorkspaceMemberSchema = z.object({
    userId: z.string().uuid('Invalid user ID'),
    role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'MEMBER', 'VIEWER']),
});

export const addMemberSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .max(VALIDATION_CONFIG.EMAIL_MAX_LENGTH, 'Email is too long'),
    role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'MEMBER', 'VIEWER']),
});

// ============================================
// PROJECT SCHEMAS
// ============================================

export const projectNameSchema = z
    .string()
    .min(1, 'Project name is required')
    .min(VALIDATION_CONFIG.NAME_MIN_LENGTH, `Project name must be at least ${VALIDATION_CONFIG.NAME_MIN_LENGTH} characters`)
    .max(VALIDATION_CONFIG.NAME_MAX_LENGTH, 'Project name is too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Project name can only contain letters, numbers, spaces, hyphens, and underscores');

export const createProjectSchema = z.object({
    workspaceId: z.string().min(1, 'Workspace ID is required'),
    name: projectNameSchema,
    description: z
        .string()
        .max(VALIDATION_CONFIG.DESCRIPTION_MAX_LENGTH, 'Description is too long')
        .optional(),
});

export const updateProjectSchema = z.object({
    name: projectNameSchema.optional(),
    description: z
        .string()
        .max(VALIDATION_CONFIG.DESCRIPTION_MAX_LENGTH, 'Description is too long')
        .optional(),
    archived: z.boolean().optional(),
});

// ============================================
// BOARD SCHEMAS
// ============================================

export const boardNameSchema = z
    .string()
    .min(1, 'Board name is required')
    .min(VALIDATION_CONFIG.NAME_MIN_LENGTH, `Board name must be at least ${VALIDATION_CONFIG.NAME_MIN_LENGTH} characters`)
    .max(VALIDATION_CONFIG.NAME_MAX_LENGTH, 'Board name is too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Board name can only contain letters, numbers, spaces, hyphens, and underscores');

export const createBoardSchema = z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    workspaceId: z.string().min(1, 'Workspace ID is required'),
    name: boardNameSchema,
    coverColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
});

export const updateBoardSchema = z.object({
    name: boardNameSchema.optional(),
    coverColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    archived: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
});

// ============================================
// TASK SCHEMAS
// ============================================

export const taskTitleSchema = z
    .string()
    .min(1, 'Task title is required')
    .min(VALIDATION_CONFIG.NAME_MIN_LENGTH, `Task title must be at least ${VALIDATION_CONFIG.NAME_MIN_LENGTH} characters`)
    .max(VALIDATION_CONFIG.NAME_MAX_LENGTH, 'Task title is too long');

export const createTaskSchema = z.object({
    listId: z.string().min(1, 'List ID is required'),
    boardId: z.string().min(1, 'Board ID is required'),
    projectId: z.string().min(1, 'Project ID is required'),
    workspaceId: z.string().min(1, 'Workspace ID is required'),
    title: taskTitleSchema,
    description: z
        .string()
        .max(VALIDATION_CONFIG.DESCRIPTION_MAX_LENGTH, 'Description is too long')
        .optional(),
    assignedTo: z.string().nullable().optional(),
    labels: z.array(z.string()).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    dueDate: z.string().datetime().nullable().optional(),
    position: z.number().int().min(0),
});

export const updateTaskSchema = z.object({
    title: taskTitleSchema.optional(),
    description: z
        .string()
        .max(VALIDATION_CONFIG.DESCRIPTION_MAX_LENGTH, 'Description is too long')
        .optional(),
    assignedTo: z.string().nullable().optional(),
    labels: z.array(z.string()).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    dueDate: z.string().datetime().nullable().optional(),
    position: z.number().int().min(0).optional(),
    status: z.enum(['todo', 'inProgress', 'inReview', 'done']).optional(),
    listId: z.string().optional(),
    archived: z.boolean().optional(),
});

// ============================================
// COMMENT SCHEMAS
// ============================================

export const createCommentSchema = z.object({
    taskId: z.string().min(1, 'Task ID is required'),
    text: z
        .string()
        .min(1, 'Comment text is required')
        .max(VALIDATION_CONFIG.DESCRIPTION_MAX_LENGTH, 'Comment is too long'),
    mentions: z.array(z.string()).optional(),
});

export const updateCommentSchema = z.object({
    text: z
        .string()
        .min(1, 'Comment text is required')
        .max(VALIDATION_CONFIG.DESCRIPTION_MAX_LENGTH, 'Comment is too long'),
    mentions: z.array(z.string()).optional(),
});

// ============================================
// PROFILE SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(VALIDATION_CONFIG.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION_CONFIG.NAME_MIN_LENGTH} characters`)
        .max(VALIDATION_CONFIG.NAME_MAX_LENGTH, 'Name is too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
        .optional(),
    title: z
        .string()
        .max(VALIDATION_CONFIG.NAME_MAX_LENGTH, 'Title is too long')
        .optional(),
    bio: z
        .string()
        .max(VALIDATION_CONFIG.DESCRIPTION_MAX_LENGTH, 'Bio is too long')
        .optional(),
    avatar: z.string().url('Invalid avatar URL').nullable().optional(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate data against a schema and return typed result
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
} {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: Record<string, string> = {};
            if (error.errors && Array.isArray(error.errors)) {
                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    errors[path] = err.message;
                });
            }
            return { success: false, errors };
        }
        return { success: false, errors: { _general: 'Validation failed' } };
    }
}

/**
 * Validate data and throw error if invalid
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}
