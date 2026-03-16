import { NextRequest, NextResponse } from 'next/server';
import { createResetToken } from '@/lib/passwordSecurity';

/**
 * API Route: Request Password Reset
 * 
 * Generates a secure reset token and sends reset email
 * Token expires after 15 minutes
 */
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // TODO: Check if user exists in database
        // const user = await db.users.findUnique({ where: { email } });
        // if (!user) {
        //     // Don't reveal if email exists (security best practice)
        //     return NextResponse.json({ success: true });
        // }

        // Generate reset token
        const resetToken = createResetToken(email);

        // TODO: Send reset email
        // await sendEmail({
        //     to: email,
        //     subject: 'Password Reset Request',
        //     html: `
        //         <p>Click the link below to reset your password:</p>
        //         <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken.token}">
        //             Reset Password
        //         </a>
        //         <p>This link expires in 15 minutes.</p>
        //     `
        // });

        console.log('Reset token generated:', {
            email,
            token: resetToken.token,
            expiresAt: new Date(resetToken.expiresAt).toISOString()
        });

        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, a reset link has been sent.'
        });

    } catch (error) {
        console.error('Password reset request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
