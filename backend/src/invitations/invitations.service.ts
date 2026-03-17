import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomBytes } from 'crypto';
import { Invitation, InvitationStatus } from './entities/invitation.entity';
import { User } from '../auth/entities/user.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';
import {
  WorkspaceMember,
  WorkspaceMemberRole,
} from '../workspaces/entities/workspace-member.entity';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';
@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepository: Repository<WorkspaceMember>,
    private emailService: EmailService,
    private configService: ConfigService,
    private dataSource: DataSource,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Check if invitation feature is enabled
   */
  private checkFeatureEnabled(): void {
    const enabled = this.configService.get<boolean>(
      'INVITE_FEATURE_ENABLED',
      false,
    );
    if (!enabled) {
      throw new NotFoundException('Feature not available');
    }
  }

  /**
   * Generate cryptographically secure invitation token
   * Minimum 32 characters (64 hex characters from 32 bytes)
   */
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Calculate expiry date (7 days from now)
   */
  private calculateExpiry(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return expiry;
  }

  /**
   * Create a new workspace invitation
   */
  async createInvitation(
    workspaceId: string,
    invitedEmail: string,
    role: string,
    inviterId: string,
  ): Promise<Invitation> {
    this.checkFeatureEnabled();

    // Validate workspace exists
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['owner'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Verify inviter is workspace owner or admin
    const inviterMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId: inviterId },
    });
    const isOwner = workspace.ownerId === inviterId;
    const isAdmin = inviterMember?.role === WorkspaceMemberRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only workspace owners and admins can invite members');
    }

    // Get inviter user to check email
    const inviter = await this.userRepository.findOne({
      where: { id: inviterId },
    });

    if (!inviter) {
      throw new NotFoundException('Inviter not found');
    }

    // Prevent self-invitation
    if (inviter.email.toLowerCase() === invitedEmail.toLowerCase()) {
      throw new BadRequestException('You cannot invite yourself to the workspace');
    }

    // Validate role
    const validRoles = Object.values(WorkspaceMemberRole);
    if (!validRoles.includes(role as WorkspaceMemberRole)) {
      throw new BadRequestException(
        `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      );
    }

    // Prevent inviting someone as Owner - only one owner per workspace
    if (role === WorkspaceMemberRole.OWNER) {
      throw new BadRequestException(
        'Cannot invite someone as Owner. There can only be one workspace owner.',
      );
    }

    // Check if email is already a workspace member
    const existingMember = await this.workspaceMemberRepository
      .createQueryBuilder('wm')
      .innerJoin('wm.user', 'user')
      .where('wm.workspaceId = :workspaceId', { workspaceId })
      .andWhere('user.email = :email', { email: invitedEmail })
      .getOne();

    if (existingMember) {
      throw new BadRequestException(
        'This user is already a member of the workspace',
      );
    }

    // Check for existing pending invitation
    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        workspaceId,
        invitedEmail,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new BadRequestException(
        'An invitation for this email is already pending',
      );
    }

    // Generate token and create invitation
    const token = this.generateToken();
    const expiresAt = this.calculateExpiry();

    const invitation = this.invitationRepository.create({
      workspaceId,
      invitedEmail,
      role,
      token,
      status: InvitationStatus.PENDING,
      invitedBy: inviterId,
      expiresAt,
    });

    await this.invitationRepository.save(invitation);

    // Send invitation email (don't fail if email fails)
    try {
      const inviterName = inviter
        ? `${inviter.firstName} ${inviter.lastName}`
        : 'A team member';

      await this.emailService.sendInvitationEmail(
        invitedEmail,
        token,
        workspace.name,
        inviterName,
        role,
      );
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      // Log but don't fail - invitation is still created
    }

    return invitation;
  }

  /**
   * Validate invitation token
   */
  async validateToken(token: string): Promise<Invitation> {
    this.checkFeatureEnabled();

    const invitation = await this.invitationRepository.findOne({
      where: { token },
      relations: ['workspace', 'inviter'],
    });

    if (!invitation) {
      await this.clearStaleTokenFromUsers(token);
      throw new BadRequestException('Invalid invitation link. The invitation may have been deleted or the link is incorrect.');
    }

    if (!invitation.workspace) {
      const workspaceExists = await this.workspaceRepository.findOne({
        where: { id: invitation.workspaceId },
      });

      if (!workspaceExists) {
        await this.clearStaleTokenFromUsers(token);
        await this.invitationRepository.remove(invitation);
        throw new NotFoundException(
          'The workspace associated with this invitation no longer exists. It may have been deleted. Please contact the workspace owner.',
        );
      }

      invitation.workspace = workspaceExists;
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      await this.clearStaleTokenFromUsers(token);

      const statusMessages = {
        [InvitationStatus.ACCEPTED]: 'This invitation has already been accepted. You are already a member of this workspace.',
        [InvitationStatus.CANCELLED]: 'This invitation has been cancelled by the workspace owner.',
        [InvitationStatus.EXPIRED]: 'This invitation has expired. Please contact the workspace owner for a new invitation.',
      };

      throw new BadRequestException(statusMessages[invitation.status] || 'This invitation is no longer valid.');
    }

    const now = new Date();
    if (now > new Date(invitation.expiresAt)) {
      await this.clearStaleTokenFromUsers(token);
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
      throw new BadRequestException(
        'This invitation has expired. Please contact the workspace owner for a new invitation.',
      );
    }

    return invitation;
  }

  /**
   * Clear stale token from users
   * Prevents redirect loops with invalid tokens
   */
  private async clearStaleTokenFromUsers(token: string): Promise<void> {
    const usersWithToken = await this.userRepository.find({
      where: { pendingInviteToken: token },
    });

    for (const user of usersWithToken) {
      user.pendingInviteToken = null;
      await this.userRepository.save(user);
    }
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(token: string, userId: string): Promise<{ workspaceId: string; workspaceName: string; role: string }> {
    this.checkFeatureEnabled();

    // Validate token
    const invitation = await this.validateToken(token);

    // Get user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify email matches
    if (user.email !== invitation.invitedEmail) {
      throw new BadRequestException(
        'This invitation was sent to a different email address',
      );
    }

    // Store workspace name and role before transaction
    const workspaceId = invitation.workspaceId;
    const workspaceName = invitation.workspace.name;
    const role = invitation.role;

    // Use transaction to ensure atomicity
    await this.dataSource.transaction(async (manager) => {
      // Check if already a member (race condition protection)
      const existingMember = await manager.findOne(WorkspaceMember, {
        where: {
          workspaceId: invitation.workspaceId,
          userId,
        },
      });

      if (existingMember) {
        throw new BadRequestException(
          'You are already a member of this workspace',
        );
      }

      // Create workspace member
      const member = manager.create(WorkspaceMember, {
        workspaceId: invitation.workspaceId,
        userId,
        role: invitation.role as WorkspaceMemberRole,
        invitedBy: invitation.invitedBy,
      });

      await manager.save(WorkspaceMember, member);

      // Update workspace member count
      await manager.increment(
        Workspace,
        { id: invitation.workspaceId },
        'memberCount',
        1,
      );

      // Set as active workspace and mark onboarding as complete (BOTH fields)
      user.activeWorkspaceId = invitation.workspaceId;
      user.pendingInviteToken = null;
      user.onboardingCompleted = true;
      await manager.save(User, user);

      // Mark invitation as accepted
      invitation.status = InvitationStatus.ACCEPTED;
      invitation.acceptedAt = new Date();
      await manager.save(Invitation, invitation);
    });

    // Notify workspace owner that a new member joined
    try {
      const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });
      if (workspace) {
        const newMemberName = `${user.firstName} ${user.lastName}`.trim();
        await this.notificationsService.notifyWorkspaceMemberJoined(
          workspaceId,
          workspace.ownerId,
          newMemberName,
          workspaceName,
        );
      }
    } catch (err) {
      console.error('[acceptInvitation] Failed to send member joined notification:', err.message);
    }

    return { workspaceId, workspaceName, role };
  }

  /**
   * Decline invitation by token (invitee action — no auth required)
   * Marks the invitation as cancelled and clears the pending token from the user
   */
  async declineInvitation(token: string): Promise<void> {
    this.checkFeatureEnabled();

    const invitation = await this.invitationRepository.findOne({
      where: { token },
    });

    if (!invitation) {
      // Already gone — treat as success, nothing to do
      return;
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      // Already actioned — treat as success
      return;
    }

    invitation.status = InvitationStatus.CANCELLED;
    await this.invitationRepository.save(invitation);

    // Clear the token from any user who has it stored
    await this.clearStaleTokenFromUsers(token);
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(invitationId: string, userId: string): Promise<void> {
    this.checkFeatureEnabled();

    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['workspace'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify user is workspace owner
    const workspace = await this.workspaceRepository.findOne({
      where: { id: invitation.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Compare as strings to handle UUID type differences
    if (String(workspace.ownerId) !== String(userId)) {
      throw new ForbiddenException(
        'Only workspace owner can cancel invitations',
      );
    }

    if (invitation.status === InvitationStatus.CANCELLED) {
      throw new BadRequestException('Invitation is already cancelled');
    }

    // Allow cancelling accepted invitations where the member was removed
    if (invitation.status === InvitationStatus.ACCEPTED) {
      const stillMember = await this.workspaceMemberRepository
        .createQueryBuilder('wm')
        .innerJoin('wm.user', 'user')
        .where('wm.workspaceId = :workspaceId', { workspaceId: invitation.workspaceId })
        .andWhere('user.email = :email', { email: invitation.invitedEmail })
        .getOne();

      if (stillMember) {
        throw new BadRequestException(
          'Cannot cancel an accepted invitation while the user is still a workspace member',
        );
      }
      // Member was removed — allow cancel to reset the record
    } else if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Only pending invitations can be cancelled');
    }

    invitation.status = InvitationStatus.CANCELLED;
    await this.invitationRepository.save(invitation);
  }

  /**
   * Resend invitation
   */
  async resendInvitation(
    invitationId: string,
    userId: string,
  ): Promise<Invitation> {
    this.checkFeatureEnabled();

    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['workspace'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify user is workspace owner
    const workspace = await this.workspaceRepository.findOne({
      where: { id: invitation.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Compare as strings to handle UUID type differences
    if (String(workspace.ownerId) !== String(userId)) {
      throw new ForbiddenException(
        'Only workspace owner can resend invitations',
      );
    }

    // Only resend pending, expired, cancelled, or accepted-but-removed invitations
    if (
      ![InvitationStatus.PENDING, InvitationStatus.EXPIRED, InvitationStatus.CANCELLED].includes(
        invitation.status,
      )
    ) {
      // Allow resend for accepted invitations if the user was removed from the workspace
      if (invitation.status === InvitationStatus.ACCEPTED) {
        const stillMember = await this.workspaceMemberRepository
          .createQueryBuilder('wm')
          .innerJoin('wm.user', 'user')
          .where('wm.workspaceId = :workspaceId', { workspaceId: invitation.workspaceId })
          .andWhere('user.email = :email', { email: invitation.invitedEmail })
          .getOne();

        if (stillMember) {
          throw new BadRequestException(
            'This user is still a member of the workspace',
          );
        }
        // User was removed — allow resend by resetting status
      } else {
        throw new BadRequestException(
          'Only pending or expired invitations can be resent',
        );
      }
    }

    // Store old token to clear from users
    const oldToken = invitation.token;

    // Generate new token and reset expiry
    const newToken = this.generateToken();
    invitation.token = newToken;
    invitation.expiresAt = this.calculateExpiry();
    invitation.status = InvitationStatus.PENDING;

    await this.invitationRepository.save(invitation);

    // Update any user who has the old token stored (prevents redirect loops)
    const usersWithOldToken = await this.userRepository.find({
      where: { pendingInviteToken: oldToken },
    });

    for (const user of usersWithOldToken) {
      user.pendingInviteToken = newToken;
      await this.userRepository.save(user);
    }

    // Resend email
    try {
      const inviter = await this.userRepository.findOne({ where: { id: userId } });
      const inviterName = inviter
        ? `${inviter.firstName} ${inviter.lastName}`
        : 'A team member';

      await this.emailService.sendInvitationEmail(
        invitation.invitedEmail,
        newToken,
        workspace.name,
        inviterName,
        invitation.role,
      );
    } catch (error) {
      console.error('Failed to resend invitation email:', error);
    }

    return invitation;
  }

  /**
   * Get workspace invitations
   */
  async getWorkspaceInvitations(
    workspaceId: string,
    userId: string,
    status?: InvitationStatus,
  ): Promise<Invitation[]> {
    this.checkFeatureEnabled();

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (String(workspace.ownerId) !== String(userId)) {
      throw new ForbiddenException('Only workspace owner can view invitations');
    }

    const query = this.invitationRepository
      .createQueryBuilder('invitation')
      .leftJoinAndSelect('invitation.inviter', 'inviter')
      .where('invitation.workspaceId = :workspaceId', { workspaceId });

    if (status) {
      query.andWhere('invitation.status = :status', { status });
    }

    query.orderBy('invitation.createdAt', 'DESC');

    const invitations = await query.getMany();

    // For accepted invitations, check if the user is still a workspace member
    const currentMembers = await this.workspaceMemberRepository.find({
      where: { workspaceId },
      relations: ['user'],
    });
    const memberEmails = new Set(
      currentMembers.map((m) => m.user?.email?.toLowerCase()).filter(Boolean),
    );

    return invitations.map((inv) => ({
      ...inv,
      memberRemoved:
        inv.status === InvitationStatus.ACCEPTED &&
        !memberEmails.has(inv.invitedEmail.toLowerCase()),
    })) as any;
  }

  /**
   * Delete an invitation record (owner only)
   * Allowed for accepted, cancelled, or expired invitations
   */
  async deleteInvitation(invitationId: string, userId: string): Promise<void> {
    this.checkFeatureEnabled();

    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: invitation.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (String(workspace.ownerId) !== String(userId)) {
      throw new ForbiddenException('Only workspace owner can delete invitations');
    }

    // Block deletion of pending invitations unless the role is invalid
    const validRoles = Object.values(WorkspaceMemberRole);
    const roleIsInvalid = !validRoles.includes(invitation.role as WorkspaceMemberRole);

    if (invitation.status === InvitationStatus.PENDING && !roleIsInvalid) {
      throw new BadRequestException('Cancel the invitation before deleting it');
    }

    await this.invitationRepository.remove(invitation);
  }

  /**
   * Cleanup expired invitations (scheduled job)
   * Runs once daily to mark expired invitations
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredInvitations(): Promise<number> {
    const result = await this.invitationRepository
      .createQueryBuilder()
      .update(Invitation)
      .set({ status: InvitationStatus.EXPIRED })
      .where('status = :status', { status: InvitationStatus.PENDING })
      .andWhere('expiresAt < :now', { now: new Date() })
      .execute();

    const affected = result.affected || 0;
    if (affected > 0) {
      console.log(`Marked ${affected} invitations as expired`);
    }

    return affected;
  }
}
