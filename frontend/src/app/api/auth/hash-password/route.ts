import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/passwordSecurity';

/**
 * API Route: Hash Password
 * 
 * This is a placeholder for backend password hashing.
 * In production, this should:
 * 1. Use bcrypt for hashing
 * 2. Never return the hash to the client
 * 3. Store the hash securely in a database
 * 4. Implement proper authentication
 */
export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        if (!password || typeof password !== 'string') {
            return NextResponse.json(
                { error: 'Password is required' },
                { status: 400 }
            );
        }

        // Validate password strength on backend too
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // TODO: Store hashedPassword in database
        // await db.users.update({ password: hashedPassword });

        return NextResponse.json({
            success: true,
            message: 'Password hashed successfully'
            // Never return the hash to the client in production
        });

    } catch (error) {
        console.error('Password hashing error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
