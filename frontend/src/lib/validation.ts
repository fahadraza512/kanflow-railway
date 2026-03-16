/**
 * Validation utilities for names (workspace, project, board, task)
 */

/**
 * Validates that a name contains only allowed characters:
 * - Letters (A-Z, a-z)
 * - Numbers (0-9)
 * - Spaces
 * - Hyphens (-)
 * - Underscores (_)
 * 
 * Special characters and symbols are NOT allowed.
 */
export function validateNameCharacters(name: string): { isValid: boolean; error?: string } {
    if (!name || !name.trim()) {
        return { isValid: false, error: "Name cannot be empty" };
    }

    // Only allow letters, numbers, spaces, hyphens, and underscores
    const allowedPattern = /^[a-zA-Z0-9\s\-_]+$/;
    
    if (!allowedPattern.test(name)) {
        return { 
            isValid: false, 
            error: "Name can only contain letters, numbers, spaces, hyphens (-), and underscores (_). Special characters and symbols are not allowed." 
        };
    }

    return { isValid: true };
}

/**
 * Checks if a name is duplicate in a list, optionally excluding a specific ID
 */
export function isDuplicateName(
    name: string, 
    existingItems: Array<{ id: string | number; name: string }>,
    excludeId?: string | number
): boolean {
    return existingItems.some(item => 
        item.name.toLowerCase() === name.trim().toLowerCase() && 
        item.id !== excludeId
    );
}

/**
 * Validates workspace name
 */
export function validateWorkspaceName(name: string): { isValid: boolean; error?: string } {
    return validateNameCharacters(name);
}

/**
 * Validates project name
 */
export function validateProjectName(name: string): { isValid: boolean; error?: string } {
    return validateNameCharacters(name);
}

/**
 * Validates board name
 */
export function validateBoardName(name: string): { isValid: boolean; error?: string } {
    return validateNameCharacters(name);
}

/**
 * Validates task title
 */
export function validateTaskTitle(title: string): { isValid: boolean; error?: string } {
    return validateNameCharacters(title);
}
