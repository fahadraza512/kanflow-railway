import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceMember, WorkspaceMemberRole } from '../../workspaces/entities/workspace-member.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';

export type Role = 'viewer' | 'member' | 'pm' | 'admin' | 'owner';

const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 1,
  member: 2,
  pm: 3,
  admin: 4,
  owner: 5,
};

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
  ) {}

  /**
   * Get the user's role in a workspace.
   * Returns 'owner' if they own it, their member role otherwise, or null if no access.
   */
  async getUserRole(userId: string, workspaceId: string): Promise<Role | null> {
    const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });
    if (!workspace) return null;

    if (workspace.ownerId === userId) return 'owner';

    const member = await this.workspaceMemberRepository.findOne({
      where: { userId, workspaceId },
    });

    if (!member) return null;
    return member.role as Role;
  }

  /** Returns true if the user's role meets or exceeds the required role */
  hasRole(userRole: Role, requiredRole: Role): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
  }

  /**
   * Throws ForbiddenException if user doesn't have the required role.
   */
  async requireRole(userId: string, workspaceId: string, requiredRole: Role): Promise<Role> {
    const role = await this.getUserRole(userId, workspaceId);

    if (!role) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    if (!this.hasRole(role, requiredRole)) {
      throw new ForbiddenException(
        `This action requires ${requiredRole} role or higher. Your current role is ${role}.`,
      );
    }

    return role;
  }
}
