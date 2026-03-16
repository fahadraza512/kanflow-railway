"use client";

import { useTokenValidation } from "@/hooks/useTokenValidation";

/**
 * Component that validates JWT token on app load
 * If token is invalid or user no longer exists, logs out the user
 */
export default function TokenValidator() {
    useTokenValidation();
    return null;
}
