// Standardized API types for consistent data structures

// ============================================
// STANDARDIZED ROLE TYPES
// ============================================
export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER' | 'VIEWER';

export const USER_ROLES = {
    ADMIN: 'ADMIN' as UserRole,
    PROJECT_MANAGER: 'PROJECT_MANAGER' as UserRole,
    MEMBER: 'MEMBER' as UserRole,
    VIEWER: 'VIEWER' as UserRole,
} as const;

// ============================================
// STANDARDIZED ID TYPE (using string for UUIDs)
// ============================================
export type EntityId = string;

// ============================================
// USER TYPES
// ============================================
export interface User {
    id: EntityId;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    title?: string;
    bio?: string;
    emailVerified: boolean;
    onboardingCompleted: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface UserProfile {
    id: EntityId;
    name: string;
    email: string;
    avatar?: string;
    title?: string;
    bio?: string;
}

// ============================================
// WORKSPACE TYPES
// ============================================
export interface Workspace {
    id: EntityId;
    name: string;
    description?: string;
    logo?: string; // Backend uses 'logo' not 'icon'
    ownerId: EntityId; // Backend uses 'ownerId' not 'createdBy'
    userRole?: string; // User's role in this workspace: 'owner', 'admin', 'pm', 'member', 'viewer'
    subscription: 'free' | 'pro'; // Backend uses 'subscription' not 'plan'
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceMember {
    userId: EntityId;
    role: UserRole;
    joinedAt: string;
}

export interface CreateWorkspaceDto {
    name: string;
    description?: string;
    logo?: string; // Backend uses 'logo' not 'icon'
    subscription?: 'free' | 'pro'; // Backend uses 'subscription' not 'plan'
}

export interface UpdateWorkspaceDto {
    name?: string;
    description?: string;
    logo?: string; // Backend uses 'logo' not 'icon'
    subscription?: 'free' | 'pro';
}

// ============================================
// PROJECT TYPES
// ============================================
export interface Project {
    id: EntityId;
    workspaceId: EntityId;
    name: string;
    description?: string;
    createdBy: EntityId;
    archived?: boolean;
    boardCount?: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateProjectDto {
    workspaceId: EntityId;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}

export interface UpdateProjectDto {
    name?: string;
    description?: string;
    isArchived?: boolean;
    color?: string;
    icon?: string;
    order?: number;
}

// ============================================
// BOARD TYPES
// ============================================
export interface Board {
    id: EntityId;
    projectId: EntityId;
    workspaceId: EntityId;
    name: string;
    coverColor?: string;
    archived?: boolean;
    position?: number;
    createdBy: EntityId;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateBoardDto {
    projectId: EntityId;
    workspaceId: EntityId;
    name: string;
    coverColor?: string;
}

export interface UpdateBoardDto {
    name?: string;
    coverColor?: string;
    archived?: boolean;
    position?: number;
}

// ============================================
// LIST TYPES
// ============================================
export interface List {
    id: EntityId;
    boardId: EntityId;
    name: string;
    position: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateListDto {
    boardId: EntityId;
    name: string;
    position: number;
}

export interface UpdateListDto {
    name?: string;
    position?: number;
}

// ============================================
// TASK TYPES
// ============================================
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'inProgress' | 'inReview' | 'done';

export interface Task {
    id: EntityId;
    listId: EntityId;
    boardId: EntityId;
    projectId: EntityId;
    workspaceId: EntityId;
    title: string;
    description?: string;
    assigneeId: EntityId | null; // Backend uses assigneeId
    assignee?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        picture?: string;
        name?: string;
    } | null;
    board?: {
        id: string;
        name: string;
        project?: {
            id: string;
            name: string;
            workspaceId: string;
            workspace?: {
                id: string;
                name: string;
            };
        };
    };
    assignedToName: string | null;
    labels: string[];
    priority: Priority;
    dueDate: string | null;
    position: number;
    status: TaskStatus;
    isArchived?: boolean; // Backend uses isArchived
    customFields?: CustomFieldValue[];
    createdBy: EntityId;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskDto {
    listId: EntityId;
    boardId: EntityId;
    projectId: EntityId;
    workspaceId: EntityId;
    title: string;
    description?: string;
    assignedTo?: EntityId | null;
    labels?: string[];
    priority?: Priority;
    dueDate?: string | null;
    position: number;
}

export interface UpdateTaskDto {
    title?: string;
    description?: string;
    assigneeId?: EntityId | null; // Backend uses assigneeId
    labels?: string[];
    priority?: Priority;
    dueDate?: string | null;
    position?: number;
    status?: TaskStatus;
    listId?: EntityId;
    isArchived?: boolean; // Backend uses isArchived, not archived
}

// ============================================
// CUSTOM FIELD TYPES
// ============================================
export interface CustomFieldValue {
    fieldId: EntityId;
    value: any;
}

// ============================================
// COMMENT TYPES
// ============================================
export interface Comment {
    id: EntityId;
    taskId: EntityId;
    userId: EntityId;
    userName: string;
    userAvatar?: string;
    text: string;
    mentions: EntityId[];
    createdAt: string;
    updatedAt?: string;
}

export interface CreateCommentDto {
    taskId: EntityId;
    text: string;
    mentions?: EntityId[];
}

export interface UpdateCommentDto {
    text: string;
    mentions?: EntityId[];
}

// ============================================
// NOTIFICATION TYPES
// ============================================
export interface Notification {
    id: EntityId;
    userId: EntityId;
    type: string;
    title: string;
    message: string;
    workspaceId?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    isRead: boolean;
    metadata?: Record<string, any>;
    createdAt: string;
}

// ============================================
// AUTHENTICATION TYPES
// ============================================
export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken?: string;
    requires2FA?: boolean;
}

export interface RefreshTokenDto {
    refreshToken: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface ResetPasswordDto {
    token: string;
    newPassword: string;
}

export interface ForgotPasswordDto {
    email: string;
}

// ============================================
// PAGINATION & FILTERING
// ============================================
export interface PaginationParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
    search?: string;
    status?: string;
    priority?: Priority;
    assignedTo?: EntityId;
    labels?: string[];
    dateFrom?: string;
    dateTo?: string;
}

// ============================================
// API RESPONSE WRAPPERS
// ============================================
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: any;
}
