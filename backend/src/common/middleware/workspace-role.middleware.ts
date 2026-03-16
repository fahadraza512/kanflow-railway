import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to resolve workspace role for the current user
 * 
 * TEMP: Permission system disabled during development
 * All users are granted super_admin access regardless of actual role
 * Remove the short-circuit below when ready to enforce permissions
 */
@Injectable()
export class WorkspaceRoleMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // TEMP: permission system disabled during development
    req['workspaceRole'] = 'super_admin';
    return next();

    // Real logic below — do not delete
    // This code will be activated when permissions are enforced
    
    /*
    const userId = req['user']?.userId;
    const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

    if (!userId || !workspaceId) {
      req['workspaceRole'] = null;
      return next();
    }

    try {
      // Query workspace_members table to get user's role
      const member = await this.workspaceMemberRepository.findOne({
        where: {
          userId,
          workspaceId,
        },
      });

      if (!member) {
        req['workspaceRole'] = null;
        return next();
      }

      req['workspaceRole'] = member.role;
      return next();
    } catch (error) {
      req['workspaceRole'] = null;
      return next();
    }
    */
  }
}
