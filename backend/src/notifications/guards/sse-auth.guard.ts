import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Custom guard for SSE endpoints that accepts JWT token from query parameter
 * EventSource doesn't support custom headers, so we need to accept token via query param
 */
@Injectable()
export class SseAuthGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Try to get token from query parameter first (for SSE)
    const tokenFromQuery = request.query.token;
    
    console.log('[SseAuthGuard] Token from query:', tokenFromQuery ? 'present' : 'missing');
    
    if (tokenFromQuery) {
      try {
        // Verify and decode the token
        const secret = this.configService.get('JWT_SECRET') || 'default-secret';
        console.log('[SseAuthGuard] Using secret:', secret ? 'loaded' : 'missing');
        
        const payload = this.jwtService.verify(tokenFromQuery, { secret });
        console.log('[SseAuthGuard] Token verified, payload:', payload);
        
        // Attach user to request (same format as JWT strategy)
        request.user = {
          userId: payload.sub,
          email: payload.email,
          role: payload.role,
          workspaceId: payload.workspaceId,
        };
        
        return true;
      } catch (error) {
        console.error('[SseAuthGuard] Token verification failed:', error.message);
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
    
    console.log('[SseAuthGuard] No token in query, falling back to header auth');
    // Fall back to standard JWT auth from header
    return super.canActivate(context) as Promise<boolean>;
  }
}
