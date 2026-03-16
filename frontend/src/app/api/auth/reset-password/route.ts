import { NextRequest, NextResponse } from 'next/server';
import { validateResetToken, markTokenAsUsed } from '@/lib/passwordSecurity';
import { hashPassword } from '@/lib/passwordSecurity';

/**
 * API Route: Reset Password
 * 
 * Handles password reset with secure token validation
 * Token expires after 15 minutes
 */
export async function POST(request: NextRequest) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json(
                { error: 'Token and new password are required' },
                { status: 400 }
            );
        }

        // Validate the reset token
        const tokenValidation = validateResetToken(token);
        
        if (!tokenValidation.valid) {
            return NextResponse.json(
                { error: tokenValidation.error },
                { status: 400 }
            );
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // Mark token as used
        markTokenAsUsed(token);

        // TODO: Update password in database
        // await db.users.update({
        //     where: { email: tokenValidation.email },
        //     data: { password: hashedPassword }
        // });

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
