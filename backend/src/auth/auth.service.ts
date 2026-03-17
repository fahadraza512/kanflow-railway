import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Board } from '../boards/entities/board.entity';
import { Task } from '../tasks/entities/task.entity';
import { List } from '../lists/entities/list.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Preference } from '../preferences/entities/preference.entity';
import { Activity } from '../activity/entities/activity.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Preference)
    private preferenceRepository: Repository<Preference>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) { }

  async register(registerDto: RegisterDto, inviteToken?: string) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      // If user exists and email IS verified, show clear message
      if (existingUser.emailVerified) {
        throw new BadRequestException('An account with this email already exists. Please login to continue.');
      }
      
      // If user exists but email is NOT verified, allow re-registration
      if (!existingUser.emailVerified) {
        // Check if verification token has expired (more than 10 minutes old)
        const tenMinutesAgo = new Date(Date.now() - 600000);

        if (existingUser.createdAt < tenMinutesAgo) {
          // Old unverified account - delete it and allow new registration
          await this.userRepository.remove(existingUser);
          console.log(`Removed old unverified account for email: ${registerDto.email}`);
        } else {
          // Recent unverified account - update it with new data
          const hashedPassword = await bcrypt.hash(registerDto.password, 10);

          // If re-registering with an invite token, auto-verify
          if (inviteToken) {
            existingUser.firstName = registerDto.firstName;
            existingUser.lastName = registerDto.lastName;
            existingUser.password = hashedPassword;
            existingUser.verificationToken = null as any;
            existingUser.verificationTokenExpires = null as any;
            existingUser.emailVerified = true;
            existingUser.pendingInviteToken = inviteToken;
            await this.userRepository.save(existingUser);
            return {
              message: 'Registration successful. Your email has been verified automatically via your invitation. You can now log in.',
              user: {
                id: existingUser.id,
                email: existingUser.email,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
              },
              emailSent: false,
              autoVerified: true,
            };
          }

          const verificationToken = uuidv4();
          const verificationTokenExpires = new Date(Date.now() + 60000); // 1 minute

          existingUser.firstName = registerDto.firstName;
          existingUser.lastName = registerDto.lastName;
          existingUser.password = hashedPassword;
          existingUser.verificationToken = verificationToken;
          existingUser.verificationTokenExpires = verificationTokenExpires;

          await this.userRepository.save(existingUser);

          // DO NOT send email automatically - user must click resend
          const response: any = {
            message: 'Registration updated. Please click "Resend Verification Email" to receive your verification link.',
            user: {
              id: existingUser.id,
              email: existingUser.email,
              firstName: existingUser.firstName,
              lastName: existingUser.lastName,
            },
            emailSent: false,
          };

          return response;
        }
      }
    }

    // Before creating new user, check for any recent unverified accounts
    // This handles the case where user changes email during signup
    const tenMinutesAgo = new Date(Date.now() - 600000);
    const recentUnverifiedUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.emailVerified = :verified', { verified: false })
      .andWhere('user.createdAt > :date', { date: tenMinutesAgo })
      .getMany();

    // Delete any recent unverified accounts to prevent old tokens from working
    if (recentUnverifiedUsers.length > 0) {
      console.log(`Found ${recentUnverifiedUsers.length} recent unverified accounts, cleaning up...`);
      for (const oldUser of recentUnverifiedUsers) {
        if (oldUser.email !== registerDto.email) {
          console.log(`Removing old unverified account: ${oldUser.email}`);
          await this.userRepository.remove(oldUser);
        }
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date(Date.now() + 60000); // 1 minute

    // If registering via an invite link, auto-verify the email.
    // The user already proved they own this inbox by receiving the invite there.
    const isInviteRegistration = !!inviteToken;

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      verificationToken: isInviteRegistration ? undefined : verificationToken,
      verificationTokenExpires: isInviteRegistration ? undefined : verificationTokenExpires,
      emailVerified: isInviteRegistration, // auto-verify for invite signups
      provider: 'local',
      pendingInviteToken: inviteToken || null,
    });

    await this.userRepository.save(user);

    // Log the saved invite token for debugging
    console.log('=== USER REGISTRATION ===');
    console.log('Email:', user.email);
    console.log('Pending Invite Token:', user.pendingInviteToken || 'NONE');
    console.log('Auto-verified (invite signup):', isInviteRegistration);
    console.log('========================');

    if (isInviteRegistration) {
      // Invite signup: email is auto-verified, redirect straight to login
      return {
        message: 'Registration successful. Your email has been verified automatically via your invitation. You can now log in.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        emailSent: false,
        autoVerified: true,
      };
    }

    // DO NOT send verification email automatically
    // User must click "Resend Verification Email" button
    console.log('User registered. Verification email will be sent when user clicks resend button.');

    const response: any = {
      message: 'Registration successful. Please click "Resend Verification Email" to receive your verification link.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      emailSent: false,
    };

    return response;
  }

  async login(loginDto: LoginDto) {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', loginDto.email);

    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    console.log('User found:', user ? 'YES' : 'NO');
    if (user) {
      console.log('User ID:', user.id);
      console.log('Email verified:', user.emailVerified);
      console.log('Has password:', !!user.password);
      console.log('Provider:', user.provider);
    }

    // Check if user exists
    if (!user) {
      console.log('ERROR: No account found');
      throw new UnauthorizedException('No account found with this email');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      console.log('ERROR: Email not verified');
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Check if user has password (for local auth)
    if (!user.password) {
      console.log('ERROR: No password set');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if password is correct
    console.log('Comparing passwords...');
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('ERROR: Incorrect password');
      throw new UnauthorizedException('Incorrect password');
    }

    console.log('Login successful! Generating token...');
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    // Check if user is a workspace member (invited user)
    const isWorkspaceMember = await this.workspaceMemberRepository.count({
      where: { userId: user.id },
    });

    const hasActiveWorkspace = !!user.activeWorkspaceId;
    const isInvitedUser = isWorkspaceMember > 0 || hasActiveWorkspace;

    // Log pending invitation status
    console.log('=== PENDING INVITATION CHECK ===');
    console.log('User ID:', user.id);
    console.log('Has Pending Invite Token:', !!user.pendingInviteToken);
    console.log('Pending Invite Token:', user.pendingInviteToken || 'NONE');
    console.log('Is Workspace Member:', isWorkspaceMember > 0);
    console.log('Has Active Workspace:', hasActiveWorkspace);
    console.log('Is Invited User:', isInvitedUser);

    // CRITICAL: Validate pending invite token before returning it
    // This prevents redirect loops with stale/invalid tokens
    let validPendingToken = user.pendingInviteToken;
    
    if (user.pendingInviteToken) {
      console.log('🔍 Validating pending invite token from user record...');
      
      const invitation = await this.workspaceRepository.manager.findOne(Invitation, {
        where: { 
          token: user.pendingInviteToken,
          status: 'pending' as any
        },
      });
      
      if (!invitation) {
        console.log('⚠️  Pending invite token is invalid/expired - clearing it');
        user.pendingInviteToken = null;
        await this.userRepository.save(user);
        validPendingToken = null;
      } else {
        const now = new Date();
        const expiresAt = new Date(invitation.expiresAt);
        
        if (now > expiresAt) {
          console.log('⚠️  Pending invite token has expired - clearing it');
          user.pendingInviteToken = null;
          await this.userRepository.save(user);
          validPendingToken = null;
        } else {
          console.log('✅ Pending invite token is valid');
        }
      }
    }

    // If no token on user record, check invitations table by email
    // This handles cross-device logins where localStorage is empty
    if (!validPendingToken) {
      console.log('🔍 Checking invitations table for pending invite by email...');
      const pendingInvitation = await this.workspaceRepository.manager
        .createQueryBuilder(Invitation, 'inv')
        .where('inv.invitedEmail = :email', { email: loginDto.email })
        .andWhere('inv.status = :status', { status: 'pending' })
        .orderBy('inv.createdAt', 'DESC')
        .getOne();

      if (pendingInvitation) {
        const now = new Date();
        const expiresAt = new Date(pendingInvitation.expiresAt);
        if (now <= expiresAt) {
          console.log('✅ Found valid pending invitation by email:', pendingInvitation.token.substring(0, 20) + '...');
          validPendingToken = pendingInvitation.token;
          // Save it back to the user record for future logins
          user.pendingInviteToken = validPendingToken;
          await this.userRepository.save(user);
        } else {
          console.log('⚠️  Found invitation by email but it has expired');
        }
      } else {
        console.log('   No pending invitation found by email');
      }
    }

    console.log('================================');

    // If user is a workspace member, they should NEVER see onboarding
    const onboardingCompleted = user.onboardingCompleted || user.onboardingComplete || isInvitedUser;

    const response: any = {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        onboardingCompleted: onboardingCompleted,
        activeWorkspaceId: user.activeWorkspaceId,
        hasPendingInvitation: !!validPendingToken,
        pendingInviteToken: validPendingToken,
        skipOnboarding: !!validPendingToken || isInvitedUser, // Explicit flag for frontend
      },
    };

    return response;
  }

  async googleLogin(user: any) {
    let existingUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (!existingUser) {
      existingUser = this.userRepository.create({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        provider: 'google',
        emailVerified: true,
        onboardingCompleted: false, // New Google users need onboarding
      });
      await this.userRepository.save(existingUser);
    }

    // Check if user is a workspace member (invited user)
    const isWorkspaceMember = await this.workspaceMemberRepository.count({
      where: { userId: existingUser.id },
    });

    const hasActiveWorkspace = !!existingUser.activeWorkspaceId;
    const isInvitedUser = isWorkspaceMember > 0 || hasActiveWorkspace;

    // If user is a workspace member, they should NEVER see onboarding
    const onboardingCompleted = existingUser.onboardingCompleted || existingUser.onboardingComplete || isInvitedUser;

    const payload = { email: existingUser.email, sub: existingUser.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: `${existingUser.firstName} ${existingUser.lastName}`,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        picture: existingUser.picture,
        onboardingCompleted: onboardingCompleted,
        activeWorkspaceId: existingUser.activeWorkspaceId,
        skipOnboarding: isInvitedUser,
      },
    };
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Invalid verification token. The link may be incorrect or already used.',
        error: 'INVALID_TOKEN',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Email address is already verified. You can proceed to login.',
        error: 'ALREADY_VERIFIED',
      });
    }

    // Check if token has expired (1 minute)
    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      // Return email in error response so frontend can use it for resend
      throw new BadRequestException({
        statusCode: 400,
        message: 'Verification link has expired. Please request a new verification email.',
        email: user.email,
        error: 'TOKEN_EXPIRED',
      });
    }

    // Mark email as verified - account is now fully created and active
    user.emailVerified = true;
    user.verificationToken = null as any;
    user.verificationTokenExpires = null as any;
    // DO NOT clear pendingInviteToken - preserve it for invitation acceptance
    await this.userRepository.save(user);

    console.log('✅ Email verified successfully for:', user.email);
    console.log('   Account is now fully created and can be used to login');
    console.log('   Has pending invitation:', !!user.pendingInviteToken);

    return { 
      message: 'Email verified successfully. Your account is now active and you can login anytime.',
      hasPendingInvitation: !!user.pendingInviteToken,
      email: user.email,
    };
  }

  // Resend verification email - recreates user if deleted by cleanup
  async resendVerification(email: string, firstName?: string, lastName?: string, password?: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // User was deleted by cleanup — recreate if we have registration data
      if (!firstName || !lastName || !password) {
        // Missing required data to recreate account
        throw new BadRequestException(
          'Account not found. Please provide your registration details (firstName, lastName, password) to resend verification.'
        );
      }

      // Create fresh user record with new token
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = uuidv4();
      const verificationTokenExpires = new Date(Date.now() + 60000); // 1 minute

      const newUser = this.userRepository.create({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpires,
        provider: 'local',
        emailVerified: false,
      });
      await this.userRepository.save(newUser);

      // Fire and forget — don't block the response on SMTP
      this.emailService.sendVerificationEmail(email, verificationToken).catch((error) => {
        console.log('Failed to send verification email:', error.message);
      });

      return { 
        message: 'Verification email sent successfully', 
        expiresIn: '1 minute',
        recreated: true 
      };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new token and expiration (invalidates old token)
    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date(Date.now() + 60000); // 1 minute

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await this.userRepository.save(user);

    // Fire and forget — don't block the response on SMTP
    this.emailService.sendVerificationEmail(email, verificationToken).catch((error) => {
      console.log('Failed to send verification email:', error.message);
    });

    return {
      message: 'Verification email sent successfully',
      expiresIn: '24 hours'
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await this.userRepository.save(user);

    // Try to send reset email, but don't fail if it fails
    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      console.log('Failed to send password reset email:', error.message);
    }

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null as any;
    user.resetPasswordExpires = null as any;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
    };
  }

  async completeOnboarding(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.onboardingCompleted = true;
    await this.userRepository.save(user);

    return {
      message: 'Onboarding completed successfully',
      onboardingCompleted: true,
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupUnverifiedAccounts() {
    // Delete unverified accounts whose verification token has expired
    const result = await this.userRepository.delete({
      emailVerified: false,
      verificationTokenExpires: LessThan(new Date()),
    });

    if (result.affected && result.affected > 0) {
      console.log(`Cleaned up ${result.affected} expired unverified account(s)`);
    }
    return { deleted: result.affected };
  }

  async cancelUnverifiedAccount(email: string) {
    console.log('Attempting to cancel unverified account for:', email);

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      console.log('User not found:', email);
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      console.log('Cannot cancel verified account:', email);
      throw new BadRequestException('Cannot cancel verified account');
    }

    await this.userRepository.remove(user);
    console.log('Successfully cancelled unverified account:', email);

    return { message: 'Unverified account cancelled successfully' };
  }

  async getEmailFromToken(token: string) {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    return { email: user.email };
  }

  async deleteAccount(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    console.log('Starting account deletion for user:', user.email);

    // Get all workspaces owned by the user
    const workspaces = await this.workspaceRepository.find({
      where: { ownerId: userId },
    });

    console.log(`Found ${workspaces.length} workspaces to delete`);

    // Delete all workspaces and their related data
    for (const workspace of workspaces) {
      // Get all projects in this workspace
      const projects = await this.projectRepository.find({
        where: { workspaceId: workspace.id },
      });

      console.log(`Deleting ${projects.length} projects in workspace ${workspace.name}`);

      // Delete all projects and their related data
      for (const project of projects) {
        // Get all boards in this project
        const boards = await this.boardRepository.find({
          where: { projectId: project.id },
        });

        console.log(`Deleting ${boards.length} boards in project ${project.name}`);

        // Delete all boards and their related data
        for (const board of boards) {
          // Delete all tasks in this board
          await this.taskRepository.delete({ boardId: board.id });

          // Delete all lists in this board
          await this.listRepository.delete({ boardId: board.id });
        }

        // Delete all boards in this project
        await this.boardRepository.delete({ projectId: project.id });

        // Delete all project members for this project (must be done before deleting project)
        await this.projectMemberRepository.delete({ projectId: project.id });
      }

      // Delete all projects in this workspace
      await this.projectRepository.delete({ workspaceId: workspace.id });
    }

    // Delete all workspaces owned by the user
    await this.workspaceRepository.delete({ ownerId: userId });

    // Delete user's activities
    await this.activityRepository.delete({ userId });

    // Delete user's notifications
    await this.notificationRepository.delete({ userId });

    // Delete user's preferences
    await this.preferenceRepository.delete({ userId });

    // Finally, delete the user
    await this.userRepository.remove(user);

    console.log('Successfully deleted account:', user.email);

    return {
      success: true,
      message: 'Account deleted successfully'
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user registered with Google
    if (user.provider === 'google') {
      throw new BadRequestException('Cannot change password for Google accounts');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }


  async markOnboardingComplete(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      onboardingCompleted: true
    });
  }

  async setActiveWorkspace(userId: string, workspaceId: string): Promise<void> {
    await this.userRepository.update(userId, {
      activeWorkspaceId: workspaceId
    });
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['activeWorkspace']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Cleanup stale pending invite tokens
   * Removes tokens that don't have matching active invitations
   */
  async cleanupStalePendingTokens(): Promise<{ cleaned: number; users: string[] }> {
    console.log('🧹 [cleanupStalePendingTokens] Starting cleanup...');
    
    // Find all users with pending invite tokens
    const usersWithTokens = await this.userRepository.find({
      where: { 
        pendingInviteToken: Not(null as any)
      },
    });

    console.log(`   Found ${usersWithTokens.length} user(s) with pending tokens`);

    const cleanedUsers: string[] = [];
    let cleanedCount = 0;

    for (const user of usersWithTokens) {
      // Check if invitation exists and is pending
      const invitation = await this.workspaceRepository.manager.findOne(Invitation, {
        where: {
          token: user.pendingInviteToken!,
          status: 'pending' as any,
        },
      });

      if (!invitation) {
        console.log(`   Clearing stale token from user: ${user.email}`);
        user.pendingInviteToken = null;
        await this.userRepository.save(user);
        cleanedUsers.push(user.email);
        cleanedCount++;
      } else {
        // Check if invitation expired
        const now = new Date();
        const expiresAt = new Date(invitation.expiresAt);
        
        if (now > expiresAt) {
          console.log(`   Clearing expired token from user: ${user.email}`);
          user.pendingInviteToken = null;
          await this.userRepository.save(user);
          cleanedUsers.push(user.email);
          cleanedCount++;
        }
      }
    }

    console.log(`✅ [cleanupStalePendingTokens] Cleaned ${cleanedCount} stale token(s)`);

    return {
      cleaned: cleanedCount,
      users: cleanedUsers,
    };
  }
}
