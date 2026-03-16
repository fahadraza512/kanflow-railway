import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { Board } from '../boards/entities/board.entity';
import { List } from '../lists/entities/list.entity';
import { Task } from '../tasks/entities/task.entity';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { PermissionsService } from '../common/permissions/permissions.service';

@Injectable()
export class ProjectsService {
  constructor(
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
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepository: Repository<WorkspaceMember>,
    private workspacesService: WorkspacesService,
    private permissionsService: PermissionsService,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    // Permission: PM+ can create projects
    await this.permissionsService.requireRole(userId, createProjectDto.workspaceId, 'pm');
    // Check for duplicate name in the same workspace (case-insensitive)
    // Check both active and archived projects
    const existingProject = await this.projectRepository
      .createQueryBuilder('project')
      .where('project.workspaceId = :workspaceId', { workspaceId: createProjectDto.workspaceId })
      .andWhere('LOWER(project.name) = LOWER(:name)', { name: createProjectDto.name })
      .getOne();

    if (existingProject) {
      if (existingProject.isArchived) {
        throw new ConflictException('A project with this name exists in archive. Please delete it first or choose a different name.');
      }
      throw new ConflictException('A project with this name already exists in this workspace');
    }

    const project = this.projectRepository.create(createProjectDto);
    const savedProject = await this.projectRepository.save(project);

    // Add creator as admin member
    const member = this.projectMemberRepository.create({
      projectId: savedProject.id,
      userId,
      role: 'admin',
    });
    await this.projectMemberRepository.save(member);

    return savedProject;
  }

  async findAll(workspaceId: string, userId: string, isArchived: boolean = false) {
    console.log(`[Projects findAll] workspaceId: ${workspaceId}, userId: ${userId}, isArchived: ${isArchived}`);
    
    // Check if user has access to this workspace (owner or member)
    const hasAccess = await this.workspacesService.hasAccess(userId, workspaceId);
    
    if (!hasAccess) {
      console.log(`[Projects findAll] User ${userId} does not have access to workspace ${workspaceId}`);
      throw new ForbiddenException('You do not have access to this workspace');
    }

    console.log(`[Projects findAll] User ${userId} has access to workspace ${workspaceId}`);

    // Check user's role in the workspace
    const workspace = await this.projectRepository.manager
      .createQueryBuilder()
      .select('workspace')
      .from('Workspace', 'workspace')
      .where('workspace.id = :workspaceId', { workspaceId })
      .getOne();

    const isOwner = workspace && (workspace as any).ownerId === userId;
    
    const workspaceMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId, userId },
    });
    
    const isAdmin = workspaceMember?.role === 'admin';
    const isPM = workspaceMember?.role === 'pm';

    // Owner, Admin, and PM can see ALL projects
    if (isOwner || isAdmin || isPM) {
      console.log(`[Projects findAll] User is Owner/Admin/PM - showing all projects`);
      const projects = await this.projectRepository.find({
        where: { 
          workspaceId,
          isArchived 
        },
        order: { order: 'ASC' }
      });

      console.log(`[Projects findAll] Found ${projects.length} projects in workspace`);

      // Get board counts for each project
      const projectsWithBoardCount = await Promise.all(
        projects.map(async (project) => {
          const boardCount = await this.boardRepository.count({
            where: { 
              projectId: project.id,
              ...(isArchived ? {} : { isArchived: false })
            }
          });

          return {
            ...project,
            boardCount,
          };
        })
      );

      return projectsWithBoardCount;
    }

    // Members and Viewers can only see projects they're assigned to
    console.log(`[Projects findAll] User is Member/Viewer - showing only assigned projects`);
    
    // Get project IDs where user is a member
    const projectMembers = await this.projectMemberRepository.find({
      where: { userId },
      select: ['projectId']
    });

    const assignedProjectIds = projectMembers.map(pm => pm.projectId);

    if (assignedProjectIds.length === 0) {
      console.log(`[Projects findAll] User has no assigned projects`);
      return [];
    }

    // Get only assigned projects
    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .where('project.workspaceId = :workspaceId', { workspaceId })
      .andWhere('project.id IN (:...projectIds)', { projectIds: assignedProjectIds })
      .andWhere('project.isArchived = :isArchived', { isArchived })
      .orderBy('project.order', 'ASC')
      .getMany();

    console.log(`[Projects findAll] Found ${projects.length} assigned projects`);

    // Get board counts for each project
    const projectsWithBoardCount = await Promise.all(
      projects.map(async (project) => {
        const boardCount = await this.boardRepository.count({
          where: { 
            projectId: project.id,
            ...(isArchived ? {} : { isArchived: false })
          }
        });

        return {
          ...project,
          boardCount,
        };
      })
    );

    return projectsWithBoardCount;
  }

  async findOne(id: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['workspace'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    console.log(`[findOne] Project: ${id}, User: ${userId}`);
    console.log(`[findOne] Workspace loaded:`, project.workspace);
    console.log(`[findOne] Workspace owner: ${project.workspace?.ownerId}`);

    await this.ensureAccess(id, userId, project.workspace);

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['workspace'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.ensureAccess(id, userId, project.workspace);

    // Permission: PM+ can update projects
    await this.permissionsService.requireRole(userId, project.workspaceId, 'pm');

    // Check for duplicate name if name is being updated (case-insensitive)
    // Check both active and archived projects
    if (updateProjectDto.name && updateProjectDto.name.toLowerCase() !== project.name.toLowerCase()) {
      const existingProject = await this.projectRepository
        .createQueryBuilder('project')
        .where('project.workspaceId = :workspaceId', { workspaceId: project.workspaceId })
        .andWhere('LOWER(project.name) = LOWER(:name)', { name: updateProjectDto.name })
        .andWhere('project.id != :id', { id })
        .getOne();

      if (existingProject) {
        if (existingProject.isArchived) {
          throw new ConflictException('A project with this name exists in archive. Please delete it first or choose a different name.');
        }
        throw new ConflictException('A project with this name already exists in this workspace');
      }
    }

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async remove(id: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['workspace'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.ensureAccess(id, userId, project.workspace);

    // Permission: PM+ can delete projects
    await this.permissionsService.requireRole(userId, project.workspaceId, 'pm');

    // Delete all related data in correct order to avoid foreign key constraints
    
    // 1. Get all boards for this project
    const boards = await this.boardRepository.find({
      where: { projectId: id }
    });

    // 2. For each board, delete all related data
    for (const board of boards) {
      // Delete all tasks in this board
      await this.taskRepository.delete({ boardId: board.id });
      
      // Delete all lists in this board
      await this.listRepository.delete({ boardId: board.id });
    }

    // 3. Delete all boards
    await this.boardRepository.delete({ projectId: id });

    // 4. Delete all project members
    await this.projectMemberRepository.delete({ projectId: id });

    // 5. Finally delete the project
    await this.projectRepository.remove(project);
    
    return { message: 'Project deleted successfully' };
  }

  async archive(id: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['workspace'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.ensureAccess(id, userId, project.workspace);

    // Permission: PM+ can archive projects
    await this.permissionsService.requireRole(userId, project.workspaceId, 'pm');

    project.isArchived = true;
    await this.projectRepository.save(project);
    return { message: 'Project archived successfully' };
  }

  async getMembers(projectId: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['workspace'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.ensureAccess(projectId, userId, project.workspace);

    // Get all project members (only manually assigned members)
    const members = await this.projectMemberRepository.find({
      where: { projectId },
      relations: ['user'],
    });

    // Filter out workspace owner (owner is not counted as a project member)
    const filteredMembers = members.filter(member => 
      member.userId !== project.workspace.ownerId
    );

    return filteredMembers;
  }

  async addMember(projectId: string, addMemberDto: AddMemberDto, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['workspace'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.ensureAccess(projectId, userId, project.workspace);

    // Check if user has permission to assign members (Owner, Admin, or PM)
    const workspace = project.workspace;
    const isOwner = workspace.ownerId === userId;
    
    // Check if user is workspace admin
    const workspaceMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId: workspace.id, userId },
    });
    const isAdmin = workspaceMember?.role === 'admin';
    const isPM = workspaceMember?.role === 'pm';

    if (!isOwner && !isAdmin && !isPM) {
      throw new ForbiddenException('Only workspace owners, admins, and project managers can assign members');
    }

    // Verify the user being added is a workspace member
    const targetUserIsWorkspaceMember = await this.workspacesService.hasAccess(
      addMemberDto.userId,
      workspace.id
    );

    if (!targetUserIsWorkspaceMember) {
      throw new ForbiddenException('User must be a workspace member to be assigned to projects');
    }

    const existingMember = await this.projectMemberRepository.findOne({
      where: { projectId, userId: addMemberDto.userId },
    });

    if (existingMember) {
      throw new ForbiddenException('User is already a member of this project');
    }

    const member = this.projectMemberRepository.create({
      projectId,
      userId: addMemberDto.userId,
      role: addMemberDto.role || 'member',
    });

    return this.projectMemberRepository.save(member);
  }

  async removeMember(projectId: string, memberId: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['workspace'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.ensureAccess(projectId, userId, project.workspace);

    // Check if user has permission to remove members (Owner, Admin, or PM)
    const workspace = project.workspace;
    const isOwner = workspace.ownerId === userId;
    
    // Check if user is workspace admin
    const workspaceMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId: workspace.id, userId },
    });
    const isAdmin = workspaceMember?.role === 'admin';
    const isPM = workspaceMember?.role === 'pm';

    if (!isOwner && !isAdmin && !isPM) {
      throw new ForbiddenException('Only workspace owners, admins, and project managers can remove members');
    }

    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this project');
    }

    await this.projectMemberRepository.remove(member);
    return { message: 'Member removed successfully' };
  }

  private async checkAccess(projectId: string, userId: string) {
    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    return member;
  }

  private async ensureAccess(projectId: string, userId: string, workspace: any) {
    console.log(`[ensureAccess] Checking access for project: ${projectId}, user: ${userId}`);
    console.log(`[ensureAccess] Workspace:`, workspace);

    // Check if user is the workspace owner (owners have access to all projects)
    console.log(`[ensureAccess] Checking if user is workspace owner...`);
    console.log(`[ensureAccess] workspace.ownerId: ${workspace?.ownerId}, userId: ${userId}`);

    if (workspace && workspace.ownerId === userId) {
      console.log(`[ensureAccess] Access granted - user is workspace owner`);
      return null; // Owner doesn't need to be a project member
    }

    // Check if user is workspace admin or PM (they have access to all projects)
    const workspaceMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId: workspace.id, userId },
    });

    if (workspaceMember && (workspaceMember.role === 'admin' || workspaceMember.role === 'pm')) {
      console.log(`[ensureAccess] Access granted - user is workspace ${workspaceMember.role}`);
      return null; // Admin/PM doesn't need to be a project member
    }

    // For regular members and viewers, check if they're assigned to this project
    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    console.log(`[ensureAccess] User is project member:`, !!member);

    if (member) {
      console.log(`[ensureAccess] Access granted - user is assigned to project`);
      return member;
    }

    // User is not assigned to this project
    console.log(`[ensureAccess] Access DENIED - user is not assigned to this project`);
    throw new ForbiddenException('You do not have access to this project. Please ask an admin to assign you.');
  }

  private async checkAdminAccess(projectId: string, userId: string) {
    const member = await this.checkAccess(projectId, userId);

    if (member.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return member;
  }
}
