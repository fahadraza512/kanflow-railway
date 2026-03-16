import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceMember, WorkspaceMemberRole } from '../entities/workspace-member.entity';
import { Workspace } from '../entities/workspace.entity';
import { User } from '../../auth/entities/user.entity';
import { RealtimeEventsService } from '../../notifications/services/realtime-events.service';

@Injectable()
export class WorkspaceMembershipService {
  private readonly logger = new Logger(WorkspaceMembershipService.name);

  constructor(
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Optional()
    @Inject('RealtimeEventsService')
    private realtimeEventsService?: RealtimeEventsService,
  ) {}

  /**
   * Gets all members of a workspace
   */
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.workspaceMemberRepository.find({
      where: { workspaceId },
      relations: ['user'],
      order: { joinedAt: 'DESC' },
    });
  }

  /**
   * Gets all workspaces for a user
   */
  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const memberships = await this.workspaceMemberRepository.find({
      where: { userId },
      relations: ['workspace'],
      order: { joinedAt: 'DESC' },
    });

    return memberships.map((m) => m.workspace);
  }

  /**
   * Checks if user is member of workspace
   */
  async isMember(userId: string, workspaceId: string): Promise<boolean> {
    const member = await this.workspaceMemberRepository.findOne({
      where: { userId, workspaceId },
    });
    return !!member;
  }

  /**
   * Gets user's role in workspace
   */
  async getUserRole(userId: string, workspaceId: string): Promise<WorkspaceMemberRole | null> {
    const member = await this.workspaceMemberRepository.findOne({
      where: { userId, workspaceId },
    });
    return member?.role || null;
  }
}
