import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember, WorkspaceMemberRole } from './entities/workspace-member.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Board } from '../boards/entities/board.entity';
import { List } from '../lists/entities/list.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../auth/entities/user.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddWorkspaceMemberDto } from './dto/add-member.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WorkspacesService {
  constructor(
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
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) { }

  isOwner(userId: string, workspace: Workspace): boolean {
    return workspace.ownerId === userId;
  }

  async isMember(userId: string, workspaceId: string): Promise<boolean> {
    const member = await this.workspaceMemberRepository.findOne({
      where: { userId, workspaceId }
    });
    return !!member;
  }

  async hasAccess(userId: string, workspaceId: string): Promise<boolean> {
    const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });
    if (!workspace) return false;
    if (this.isOwner(userId, workspace)) return true;
    return this.isMember(userId, workspaceId);
  }

  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string) {
    try {
      const userExists = await this.workspaceRepository.manager.findOne('User', {
        where: { id: userId },
      });

      if (!userExists) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const existingWorkspace = await this.workspaceRepository
        .createQueryBuilder('workspace')
        .where('workspace.ownerId = :ownerId', { ownerId: userId })
        .andWhere('LOWER(workspace.name) = LOWER(:name)', { name: createWorkspaceDto.name })
        .getOne();

      if (existingWorkspace) {
        if (existingWorkspace.isArchived) {
          throw new ConflictException('A workspace with this name exists in archive. Please delete it first or choose a different name.');
        }
        throw new ConflictException('A workspace with this name already exists');
      }

      const workspace = this.workspaceRepository.create({
        ...createWorkspaceDto,
        ownerId: userId,
      });

      const savedWorkspace = await this.workspaceRepository.save(workspace);

      const workspaceMember = this.workspaceMemberRepository.create({
        workspaceId: savedWorkspace.id,
        userId: userId,
        role: WorkspaceMemberRole.OWNER,
      });
      await this.workspaceMemberRepository.save(workspaceMember);

      await this.userRepository.update(userId, {
        activeWorkspaceId: savedWorkspace.id,
        onboardingCompleted: true
      });

      return savedWorkspace;
    } catch (error) {
      console.error('Error creating workspace:', {
        message: error.message,
        name: error.name,
        detail: error.detail,
        code: error.code,
      });
      throw error;
    }
  }

  async findAll(userId: string) {
    const ownedWorkspaces = await this.workspaceRepository.find({
      where: { ownerId: userId, isArchived: false },
      order: { createdAt: 'DESC' },
    });

    const memberWorkspaces = await this.workspaceMemberRepository
      .createQueryBuilder('wm')
      .innerJoinAndSelect('wm.workspace', 'workspace')
      .where('wm.userId = :userId', { userId })
      .andWhere('workspace.isArchived = false')
      .getMany();

    const workspaceMap = new Map<string, any>();

    for (const ws of ownedWorkspaces) {
      workspaceMap.set(ws.id, { ...ws, userRole: 'owner' });
    }

    for (const wm of memberWorkspaces) {
      if (wm.workspace && !workspaceMap.has(wm.workspace.id)) {
        workspaceMap.set(wm.workspace.id, { ...wm.workspace, userRole: wm.role });
      }
    }

    return Array.from(workspaceMap.values());
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.workspaceRepository.findOne({ where: { id } });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    let userRole = 'owner';

    if (workspace.ownerId === userId) {
      userRole = 'owner';
    } else {
      const member = await this.workspaceMemberRepository.findOne({
        where: { workspaceId: id, userId },
      });

      if (!member) {
        throw new ForbiddenException('Access denied');
      }

      userRole = member.role;
    }

    return { ...workspace, userRole };
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto, userId: string) {
    const workspace = await this.findOne(id, userId);

    if (!this.isOwner(userId, workspace)) {
      throw new ForbiddenException('Only the workspace owner can update workspace settings');
    }

    if (updateWorkspaceDto.name && updateWorkspaceDto.name.toLowerCase() !== workspace.name.toLowerCase()) {
      const existingWorkspace = await this.workspaceRepository
        .createQueryBuilder('workspace')
        .where('workspace.ownerId = :ownerId', { ownerId: userId })
        .andWhere('LOWER(workspace.name) = LOWER(:name)', { name: updateWorkspaceDto.name })
        .andWhere('workspace.id != :id', { id })
        .getOne();

      if (existingWorkspace) {
        if (existingWorkspace.isArchived) {
          throw new ConflictException('A workspace with this name exists in archive. Please delete it first or choose a different name.');
        }
        throw new ConflictException('A workspace with this name already exists');
      }
    }

    Object.assign(workspace, updateWorkspaceDto);
    return this.workspaceRepository.save(workspace);
  }

  async remove(id: string, userId: string) {
    const workspace = await this.findOne(id, userId);

    if (!this.isOwner(userId, workspace)) {
      throw new ForbiddenException('Only the workspace owner can delete the workspace');
    }

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ activeWorkspaceId: null as any })
      .where('activeWorkspaceId = :workspaceId', { workspaceId: id })
      .execute();

    const projects = await this.projectRepository.find({ where: { workspaceId: id } });

    for (const project of projects) {
      const boards = await this.boardRepository.find({ where: { projectId: project.id } });

      for (const board of boards) {
        await this.taskRepository.delete({ boardId: board.id });
        await this.listRepository.delete({ boardId: board.id });
      }

      await this.boardRepository.delete({ projectId: project.id });
      await this.projectMemberRepository.delete({ projectId: project.id });
    }

    await this.projectRepository.delete({ workspaceId: id });
    await this.workspaceMemberRepository.delete({ workspaceId: id });
    await this.workspaceRepository.remove(workspace);

    return { message: 'Workspace deleted successfully' };
  }

  async archive(id: string, userId: string) {
    const workspace = await this.findOne(id, userId);
    workspace.isArchived = true;
    await this.workspaceRepository.save(workspace);
    return { message: 'Workspace archived successfully' };
  }

  async upgradeSubscription(id: string, subscription: 'free' | 'pro') {
    const workspace = await this.workspaceRepository.findOne({ where: { id } });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    workspace.subscription = subscription;
    const updated = await this.workspaceRepository.save(workspace);

    return {
      message: `Workspace subscription upgraded to ${subscription}`,
      workspace: updated,
    };
  }

  async getMembers(workspaceId: string, userId: string) {
    try {
      const workspace = await this.findOne(workspaceId, userId);
      const isWorkspaceOwner = this.isOwner(userId, workspace);

      const members = await this.workspaceMemberRepository.find({
        where: { workspaceId },
        relations: ['user'],
        order: { joinedAt: 'DESC' },
      });

      const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000;
      const now = new Date();

      return members.map(member => {
        const baseInfo = {
          id: member.user.id,
          name: `${member.user.firstName} ${member.user.lastName}`,
          email: member.user.email,
          avatar: member.user.picture,
          role: member.role,
          joinedAt: member.joinedAt,
        };

        if (isWorkspaceOwner) {
          const lastActive = member.lastActiveAt ? new Date(member.lastActiveAt) : null;
          const isActive = lastActive && (now.getTime() - lastActive.getTime()) < ACTIVE_THRESHOLD_MS;
          return { ...baseInfo, status: isActive ? 'active' : 'inactive', lastActiveAt: member.lastActiveAt };
        }

        return baseInfo;
      });
    } catch (error) {
      console.error('Error in getMembers:', error.message);
      throw error;
    }
  }

  async getCurrentUserMember(workspaceId: string, userId: string) {
    const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId === userId) {
      return { id: userId, role: 'owner', workspaceId };
    }

    const workspaceMember = await this.workspaceRepository.manager
      .getRepository('WorkspaceMember')
      .findOne({ where: { workspaceId, userId } });

    if (workspaceMember) {
      return { id: userId, role: workspaceMember.role, workspaceId };
    }

    throw new NotFoundException('User is not a member of this workspace');
  }

  async updateMemberRole(workspaceId: string, memberUserId: string, role: string, userId: string) {
    const workspace = await this.findOne(workspaceId, userId);

    // Only owner can change roles
    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only workspace owner can update member roles');
    }

    if (memberUserId === workspace.ownerId) {
      throw new ConflictException('Cannot change owner role');
    }

    // Cannot promote to owner
    if (role === WorkspaceMemberRole.OWNER) {
      throw new BadRequestException('Cannot promote a member to Owner');
    }

    await this.workspaceMemberRepository
      .createQueryBuilder()
      .update()
      .set({ role: role as any })
      .where('userId = :memberUserId', { memberUserId })
      .andWhere('workspaceId = :workspaceId', { workspaceId })
      .execute();

    await this.projectMemberRepository
      .createQueryBuilder()
      .update()
      .set({ role: role as any })
      .where('userId = :memberUserId', { memberUserId })
      .andWhere('projectId IN (SELECT id FROM projects WHERE "workspaceId" = :workspaceId)', { workspaceId })
      .execute();

    const user = await this.workspaceRepository.manager
      .getRepository('User')
      .findOne({ where: { id: memberUserId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const changerUser = await this.userRepository.findOne({ where: { id: userId } });
      const changerName = changerUser ? `${changerUser.firstName} ${changerUser.lastName}` : 'Workspace owner';
      const oldMember = await this.workspaceMemberRepository.findOne({ where: { workspaceId, userId: memberUserId } });
      await this.notificationsService.notifyWorkspaceRoleChanged(
        memberUserId,
        changerName,
        workspace.name,
        oldMember?.role || 'member',
        role,
        workspaceId,
      );
    } catch (err) {
      console.error('[updateMemberRole] Failed to send role change notification:', err.message);
    }

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      avatar: user.picture,
      role,
    };
  }

  async removeMember(workspaceId: string, memberUserId: string, userId: string) {
    const workspace = await this.findOne(workspaceId, userId);

    // Admin+ can remove members (but not the owner)
    const requestingMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId },
    });
    const isOwner = workspace.ownerId === userId;
    const isAdmin = requestingMember?.role === WorkspaceMemberRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only workspace owner or admins can remove members');
    }

    if (memberUserId === workspace.ownerId) {
      throw new ConflictException('Cannot remove workspace owner');
    }

    await this.workspaceMemberRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :memberUserId', { memberUserId })
      .andWhere('workspaceId = :workspaceId', { workspaceId })
      .execute();

    await this.projectMemberRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :memberUserId', { memberUserId })
      .andWhere('projectId IN (SELECT id FROM projects WHERE "workspaceId" = :workspaceId)', { workspaceId })
      .execute();

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ activeWorkspaceId: null as any })
      .where('id = :memberUserId', { memberUserId })
      .andWhere('activeWorkspaceId = :workspaceId', { workspaceId })
      .execute();

    return { message: 'Member removed successfully' };
  }

  async leaveWorkspace(workspaceId: string, userId: string) {
    const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundException('Workspace not found');

    if (workspace.ownerId === userId) {
      throw new BadRequestException('Workspace owner cannot leave. Transfer ownership or delete the workspace.');
    }

    await this.workspaceMemberRepository.delete({ workspaceId, userId });
    await this.projectMemberRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('projectId IN (SELECT id FROM projects WHERE "workspaceId" = :workspaceId)', { workspaceId })
      .execute();

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ activeWorkspaceId: null as any })
      .where('id = :userId', { userId })
      .andWhere('activeWorkspaceId = :workspaceId', { workspaceId })
      .execute();

    return { message: 'You have left the workspace' };
  }

  async addMember(workspaceId: string, emailOrUserId: string, role: WorkspaceMemberRole, requestingUserId: string) {
    const workspace = await this.findOne(workspaceId, requestingUserId);

    if (workspace.ownerId !== requestingUserId) {
      throw new ForbiddenException('Only workspace owner can add members');
    }

    if (role === WorkspaceMemberRole.OWNER) {
      throw new BadRequestException('Cannot add someone as Owner. There can only be one workspace owner.');
    }

    let user;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(emailOrUserId)) {
      user = await this.workspaceRepository.manager
        .getRepository('User')
        .findOne({ where: { id: emailOrUserId } });
    }

    if (!user) {
      user = await this.workspaceRepository.manager
        .getRepository('User')
        .findOne({ where: { email: emailOrUserId } });
    }

    if (!user) {
      throw new NotFoundException('User not found with the provided email or ID');
    }

    if (user.id === requestingUserId) {
      throw new BadRequestException('You cannot add yourself to the workspace');
    }

    const existingMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId: user.id },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this workspace');
    }

    const member = this.workspaceMemberRepository.create({ workspaceId, userId: user.id, role });
    await this.workspaceMemberRepository.save(member);

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      avatar: user.picture,
      role,
    };
  }

  async getUserWorkspaces(userId: string): Promise<any[]> {
    const ownedWorkspaces = await this.workspaceRepository
      .createQueryBuilder('w')
      .select(['w.id as id', 'w.name as name', 'w.description as description', 'w.createdAt as "createdAt"', "'owner' as role"])
      .where('w.ownerId = :userId', { userId })
      .getRawMany();

    const invitedWorkspaces = await this.workspaceRepository
      .createQueryBuilder('w')
      .innerJoin('workspace_members', 'wm', 'wm.workspaceId = w.id')
      .select(['w.id as id', 'w.name as name', 'w.description as description', 'w.createdAt as "createdAt"', 'wm.role as role'])
      .where('wm.userId = :userId', { userId })
      .getRawMany();

    return [...ownedWorkspaces, ...invitedWorkspaces];
  }

  async updateUserActivity(workspaceId: string, userId: string): Promise<void> {
    try {
      const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } });

      if (!workspace) {
        throw new NotFoundException(`Workspace with ID ${workspaceId} not found`);
      }

      await this.workspaceMemberRepository
        .createQueryBuilder()
        .update()
        .set({ lastActiveAt: new Date() })
        .where('workspaceId = :workspaceId', { workspaceId })
        .andWhere('userId = :userId', { userId })
        .execute();
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.name === 'QueryFailedError') {
        console.error(`[Heartbeat] Database connection failed:`, error.message);
        throw new Error('Database connection failed');
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error(`[Heartbeat] Failed to update activity:`, error.message);
      throw error;
    }
  }
}
