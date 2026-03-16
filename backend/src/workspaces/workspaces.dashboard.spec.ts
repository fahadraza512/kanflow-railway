import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkspacesService } from './workspaces.service';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember, WorkspaceMemberRole } from './entities/workspace-member.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Board } from '../boards/entities/board.entity';
import { List } from '../lists/entities/list.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../auth/entities/user.entity';

describe('WorkspacesService - Dashboard', () => {
  let service: WorkspacesService;
  let workspaceRepository: any;
  let workspaceMemberRepository: any;

  beforeEach(async () => {
    const mockWorkspaceRepository = {
      find: jest.fn(),
    };

    const mockWorkspaceMemberRepository = {
      createQueryBuilder: jest.fn(),
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
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    workspaceRepository = module.get(getRepositoryToken(Workspace));
    workspaceMemberRepository = module.get(getRepositoryToken(WorkspaceMember));
  });

  describe('findAll (Dashboard)', () => {
    it('should return all user workspaces', async () => {
      const userId = 'user-1';

      const ownedWorkspaces = [
        {
          id: 'workspace-1',
          name: 'My Workspace',
          ownerId: userId,
          isArchived: false,
          memberCount: 5,
          createdAt: new Date('2024-01-01'),
        },
      ];

      const queryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      workspaceRepository.find.mockResolvedValue(ownedWorkspaces);
      workspaceMemberRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('workspace-1');
      expect(result[0].name).toBe('My Workspace');
    });

    it('should include workspace details', async () => {
      const userId = 'user-1';

      const ownedWorkspaces = [
        {
          id: 'workspace-1',
          name: 'My Workspace',
          ownerId: userId,
          isArchived: false,
          memberCount: 5,
          createdAt: new Date('2024-01-01'),
        },
      ];

      const queryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      workspaceRepository.find.mockResolvedValue(ownedWorkspaces);
      workspaceMemberRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(userId);

      expect(result[0]).toEqual({
        id: 'workspace-1',
        name: 'My Workspace',
        ownerId: userId,
        isArchived: false,
        memberCount: 5,
        createdAt: new Date('2024-01-01'),
        userRole: 'owner',
      });
    });

    it('should include member count', async () => {
      const userId = 'user-1';

      const ownedWorkspaces = [
        {
          id: 'workspace-1',
          name: 'My Workspace',
          ownerId: userId,
          isArchived: false,
          memberCount: 10,
          createdAt: new Date('2024-01-01'),
        },
      ];

      const queryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      workspaceRepository.find.mockResolvedValue(ownedWorkspaces);
      workspaceMemberRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(userId);

      expect(result[0].memberCount).toBe(10);
    });

    it('should order workspaces by createdAt descending', async () => {
      const userId = 'user-1';

      const ownedWorkspaces = [
        {
          id: 'workspace-3',
          name: 'Newest Workspace',
          ownerId: userId,
          isArchived: false,
          memberCount: 1,
          createdAt: new Date('2024-01-03'),
        },
        {
          id: 'workspace-2',
          name: 'Middle Workspace',
          ownerId: userId,
          isArchived: false,
          memberCount: 1,
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 'workspace-1',
          name: 'Oldest Workspace',
          ownerId: userId,
          isArchived: false,
          memberCount: 1,
          createdAt: new Date('2024-01-01'),
        },
      ];

      const queryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      workspaceRepository.find.mockResolvedValue(ownedWorkspaces);
      workspaceMemberRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(userId);

      expect(result[0].name).toBe('Newest Workspace');
      expect(result[1].name).toBe('Middle Workspace');
      expect(result[2].name).toBe('Oldest Workspace');
    });

    it('should exclude archived workspaces', async () => {
      const userId = 'user-1';

      const ownedWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Active Workspace',
          ownerId: userId,
          isArchived: false,
          memberCount: 1,
          createdAt: new Date('2024-01-01'),
        },
      ];

      const queryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      workspaceRepository.find.mockResolvedValue(ownedWorkspaces);
      workspaceMemberRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(userId);

      expect(result).toHaveLength(1);
      expect(result[0].isArchived).toBe(false);
    });

    it('should return empty array when user has no workspaces', async () => {
      const userId = 'user-1';

      const queryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      workspaceRepository.find.mockResolvedValue([]);
      workspaceMemberRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
    });

    it('should include member workspaces', async () => {
      const userId = 'user-1';

      const ownedWorkspaces = [];

      const memberWorkspaces = [
        {
          id: 'member-1',
          userId,
          role: 'member',
          workspace: {
            id: 'workspace-1',
            name: 'Shared Workspace',
            ownerId: 'owner-1',
            isArchived: false,
            memberCount: 5,
            createdAt: new Date('2024-01-01'),
          },
        },
      ];

      const queryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(memberWorkspaces),
      };

      workspaceRepository.find.mockResolvedValue(ownedWorkspaces);
      workspaceMemberRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(userId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Shared Workspace');
    });
  });
});
