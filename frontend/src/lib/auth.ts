// localStorage-based user management utilities
// No backend required — stores users in a "users" array in localStorage

export interface StoredUser {
    name: string;
    email: string;
    password: string;
    role: string;
    emailVerified: boolean;
    onboardingComplete: boolean;
    createdAt: string;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string;
    // Profile fields
    avatar?: string;
    title?: string;
    bio?: string;
    // Subscription fields (per user account, not workspace)
    plan?: "free" | "pro";
    subscriptionStatus?: "active" | "cancelled" | "expired";
    subscriptionCancelledAt?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    billingCycle?: "annual" | "monthly";
}

const USERS_KEY = "users";

/** Get all stored users */
export function getStoredUsers(): StoredUser[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

/** Save users array to localStorage */
function saveUsers(users: StoredUser[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Register a new user. Returns { success, error } */
export function registerUser(
    name: string,
    email: string,
    password: string
): { success: boolean; error?: string } {
    // Validation
    if (!name.trim()) return { success: false, error: "Full name is required." };
    if (!email.trim()) return { success: false, error: "Email is required." };
    if (!password.trim()) return { success: false, error: "Password is required." };
    if (password.length < 6) return { success: false, error: "Password must be at least 6 characters." };

    const users = getStoredUsers();

    // Check for duplicate email
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
        return { success: false, error: "An account with this email already exists." };
    }

    // Save new user
    users.push({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: "ADMIN", // first user of a workspace defaults to ADMIN
        emailVerified: false,
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
    });
    saveUsers(users);

    return { success: true };
}

/** Login a user. Returns { success, user, error } */
export function loginUser(
    email: string,
    password: string
): { success: boolean; user?: StoredUser; error?: string } {
    // Validation
    if (!email.trim()) return { success: false, error: "Email is required." };
    if (!password.trim()) return { success: false, error: "Password is required." };

    const users = getStoredUsers();

    // Find user by email
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
        return { success: false, error: "User not found. Please sign up first." };
    }

    // Check password
    if (user.password !== password) {
        return { success: false, error: "Invalid password." };
    }

    // Check email verification
    if (!user.emailVerified) {
        return { success: false, error: "Please verify your email before logging in." };
    }

    return { success: true, user };
}

/** Verify a user's email address */
export function verifyUserEmail(email: string): boolean {
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (idx === -1) return false;
    users[idx].emailVerified = true;
    saveUsers(users);
    return true;
}

/** Check if a user's email is verified */
export function isEmailVerified(email: string): boolean {
    const users = getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    return user?.emailVerified ?? false;
}

/** Mark a user's onboarding as complete */
export function completeUserOnboarding(email: string): boolean {
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (idx === -1) return false;
    users[idx].onboardingComplete = true;
    saveUsers(users);
    return true;
}

/** Update user subscription */
export function updateUserSubscription(
    email: string,
    updates: {
        plan?: "free" | "pro";
        subscriptionStatus?: "active" | "cancelled" | "expired";
        subscriptionCancelledAt?: string;
        subscriptionStartDate?: string;
        subscriptionEndDate?: string;
        billingCycle?: "annual" | "monthly";
    }
): boolean {
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (idx === -1) return false;
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    return true;
}

/** Get user by email */
export function getUserByEmail(email: string): StoredUser | null {
    const users = getStoredUsers();
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

/** Update user profile */
export function updateUserProfile(
    email: string,
    updates: {
        name?: string;
        avatar?: string | null;
        title?: string;
        bio?: string;
    }
): boolean {
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (idx === -1) return false;
    
    // Update user with new profile data
    users[idx] = { 
        ...users[idx], 
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.avatar !== undefined && { avatar: updates.avatar || undefined }),
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.bio !== undefined && { bio: updates.bio })
    };
    
    saveUsers(users);
    return true;
}
