import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkspacesService } from './workspaces.service';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { User } from '../auth/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Board } from '../boards/entities/board.entity';
import { List } from '../lists/entities/list.entity';
import { Task } from '../tasks/entities/task.entity';

describe('WorkspacesService - Access Control', () => {
  let service: WorkspacesService;
  let mockWorkspaceRepository: any;
  let mockWorkspaceMemberRepository: any;
  let mockUserRepository: any;

  const mockUser = {
    id: 'user-1',
    email: 'user@test.com',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockWorkspace = {
    id: 'workspace-1',
    name: 'Test Workspace',
    ownerId: 'user-1',
  };

  const mockMember = {
    id: 'member-1',
    workspace_id: 'workspace-1',
    user_id: 'user-2',
    role: 'member',
  };

  beforeEach(async () => {
    const createMockQueryBuilder = (getRawManyResult = []) => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(getRawManyResult),
    });

    mockWorkspaceRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
    };

    mockWorkspaceMemberRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
    };

    mockUserRepository = {
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: getRepositoryToken(Workspace),
          useValue: mockWorkspaceRepository,
        },
        {
          provide: getRepositoryToken(WorkspaceMember),
          useValue: mockWorkspaceMemberRepository,
        },
        {
          provide: getRepositoryToken(Project),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProjectMember),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Board),
          useValue: {},
        },
        {
          provide: getRepositoryToken(List),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
  });

  describe('isOwner', () => {
    it('should return true if user is workspace owner', () => {
      const result = service.isOwner('user-1', mockWorkspace);
      expect(result).toBe(true);
    });

    it('should return false if user is not workspace owner', () => {
      const result = service.isOwner('user-2', mockWorkspace);
      expect(result).toBe(false);
    });
  });

  describe('isMember', () => {
    it('should return true if user is workspace member', async () => {
      mockWorkspaceMemberRepository.findOne.mockResolvedValue(mockMember);

      const result = await service.isMember('user-2', 'workspace-1');
      expect(result).toBe(true);
      expect(mockWorkspaceMemberRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-2', workspaceId: 'workspace-1' },
      });
    });

    it('should return false if user is not workspace member', async () => {
      mockWorkspaceMemberRepository.findOne.mockResolvedValue(null);

      const result = await service.isMember('user-3', 'workspace-1');
      expect(result).toBe(false);
    });
  });

  describe('hasAccess', () => {
    it('should return true if user is workspace owner', async () => {
      mockWorkspaceRepository.findOne.mockResolvedValue(mockWorkspace);

      const result = await service.hasAccess('user-1', 'workspace-1');
      expect(result).toBe(true);
    });

    it('should return true if user is workspace member', async () => {
      mockWorkspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue(mockMember);

      const result = await service.hasAccess('user-2', 'workspace-1');
      expect(result).toBe(true);
    });

    it('should return false if user is not owner or member', async () => {
      mockWorkspaceRepository.findOne.mockResolvedValue(mockWorkspace);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue(null);

      const result = await service.hasAccess('user-3', 'workspace-1');
      expect(result).toBe(false);
    });

    it('should return false if workspace does not exist', async () => {
      mockWorkspaceRepository.findOne.mockResolvedValue(null);

      const result = await service.hasAccess('user-1', 'invalid-workspace');
      expect(result).toBe(false);
    });
  });

  describe('getMembers', () => {
    it('should return members with status when user is workspace owner', async () => {
      const mockWorkspaceWithOwner = {
        ...mockWorkspace,
        ownerId: 'user-1',
      };

      const mockMembers = [
        {
          id: 'member-1',
          workspaceId: 'workspace-1',
          userId: 'user-2',
          role: 'member',
          joinedAt: new Date(),
          lastActiveAt: new Date(),
          user: {
            id: 'user-2',
            email: 'member@test.com',
            firstName: 'Member',
            lastName: 'User',
            picture: null,
          },
        },
      ];

      // Mock findOne to return workspace (verifies access)
      mockWorkspaceRepository.findOne.mockResolvedValue(mockWorkspaceWithOwner);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue(null);

      // Mock find to return members
      mockWorkspaceMemberRepository.find.mockResolvedValue(mockMembers);

      const result = await service.getMembers('workspace-1', 'user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'user-2',
        email: 'member@test.com',
        role: 'member',
        status: 'active',
      });
    });

    it('should return members without status when non-owner accesses', async () => {
      const mockWorkspaceWithOwner = {
        ...mockWorkspace,
        ownerId: 'user-1',
      };

      const mockMemberRecord = {
        id: 'member-1',
        workspaceId: 'workspace-1',
        userId: 'user-2',
        role: 'member',
      };

      const mockMembers = [
        {
          id: 'member-1',
          userId: 'user-2',
          role: 'member',
          joinedAt: new Date(),
          lastActiveAt: new Date(),
          user: {
            id: 'user-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
        },
      ];

      // Mock findOne to return workspace (verifies access)
      mockWorkspaceRepository.findOne.mockResolvedValue(mockWorkspaceWithOwner);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue(mockMemberRecord);
      mockWorkspaceMemberRepository.find.mockResolvedValue(mockMembers);

      const result = await service.getMembers('workspace-1', 'user-2');

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('status');
      expect(result[0]).not.toHaveProperty('lastActiveAt');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('role');
    });

    it('should calculate inactive status for members with old lastActiveAt', async () => {
      const mockWorkspaceWithOwner = {
        ...mockWorkspace,
        ownerId: 'user-1',
      };

      const oldDate = new Date();
      oldDate.setMinutes(oldDate.getMinutes() - 10); // 10 minutes ago

      const mockMembers = [
        {
          id: 'member-1',
          workspaceId: 'workspace-1',
          userId: 'user-2',
          role: 'member',
          joinedAt: new Date(),
          lastActiveAt: oldDate,
          user: {
            id: 'user-2',
            email: 'member@test.com',
            firstName: 'Member',
            lastName: 'User',
            picture: null,
          },
        },
      ];

      mockWorkspaceRepository.findOne.mockResolvedValue(mockWorkspaceWithOwner);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue(null);
      mockWorkspaceMemberRepository.find.mockResolvedValue(mockMembers);

      const result = await service.getMembers('workspace-1', 'user-1');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('inactive');
    });

    it('should calculate inactive status for members with null lastActiveAt', async () => {
      const mockWorkspaceWithOwner = {
        ...mockWorkspace,
        ownerId: 'user-1',
      };

      const mockMembers = [
        {
          id: 'member-1',
          workspaceId: 'workspace-1',
          userId: 'user-2',
          role: 'member',
          joinedAt: new Date(),
          lastActiveAt: null,
          user: {
            id: 'user-2',
            email: 'member@test.com',
            firstName: 'Member',
            lastName: 'User',
            picture: null,
          },
        },
      ];

      mockWorkspaceRepository.findOne.mockResolvedValue(mockWorkspaceWithOwner);
      mockWorkspaceMemberRepository.findOne.mockResolvedValue(null);
      mockWorkspaceMemberRepository.find.mockResolvedValue(mockMembers);

      const result = await service.getMembers('workspace-1', 'user-1');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('inactive');
    });
  });

  describe('getUserWorkspaces', () => {
    it('should return owned and member workspaces', async () => {
      const ownedWorkspaces = [
        { id: 'workspace-1', name: 'Owned', description: null, createdAt: new Date(), role: 'owner' }
      ];
      const invitedWorkspaces = [
        { id: 'workspace-2', name: 'Member', description: null, createdAt: new Date(), role: 'member' }
      ];

      const mockOwnedQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(ownedWorkspaces),
      };

      const mockInvitedQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(invitedWorkspaces),
        getSql: jest.fn().mockReturnValue('SELECT * FROM workspace_members'),
      };

      const mockDebugQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getSql: jest.fn().mockReturnValue('SELECT * FROM workspace_members'),
      };

      mockWorkspaceRepository.createQueryBuilder
        .mockReturnValueOnce(mockOwnedQueryBuilder)
        .mockReturnValueOnce(mockInvitedQueryBuilder)
        .mockReturnValueOnce(mockDebugQueryBuilder);

      const result = await service.getUserWorkspaces('user-1');

      expect(result).toHaveLength(2);
      expect(result).toEqual([...ownedWorkspaces, ...invitedWorkspaces]);
    });

    it('should return only owned workspaces if user has no memberships', async () => {
      const ownedWorkspaces = [
        { id: 'workspace-1', name: 'Owned', description: null, createdAt: new Date(), role: 'owner' }
      ];

      const mockOwnedQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(ownedWorkspaces),
      };

      const mockInvitedQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
        getSql: jest.fn().mockReturnValue('SELECT * FROM workspace_members'),
      };

      const mockDebugQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getSql: jest.fn().mockReturnValue('SELECT * FROM workspace_members'),
      };

      mockWorkspaceRepository.createQueryBuilder
        .mockReturnValueOnce(mockOwnedQueryBuilder)
        .mockReturnValueOnce(mockInvitedQueryBuilder)
        .mockReturnValueOnce(mockDebugQueryBuilder);

      const result = await service.getUserWorkspaces('user-1');

      expect(result).toHaveLength(1);
      expect(result).toEqual(ownedWorkspaces);
    });
  });
});
