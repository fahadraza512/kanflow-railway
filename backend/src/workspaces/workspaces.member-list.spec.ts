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

describe('WorkspacesService - Member List', () => {
  let service: WorkspacesService;
  let workspaceMemberRepository: any;
  let workspaceRepository: any;

  beforeEach(async () => {
    const mockWorkspaceMemberRepository = {
      find: jest.fn(),
    };

    const mockWorkspaceRepository = {
      findOne: jest.fn(),
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
    workspaceMemberRepository = module.get(getRepositoryToken(WorkspaceMember));
    workspaceRepository = module.get(getRepositoryToken(Workspace));
  });

  describe('getMembers', () => {
    it('should return all workspace members', async () => {
      const workspaceId = 'workspace-1';
      const userId = 'user-1';
      const ownerId = 'owner-1';

      const workspace = {
        id: workspaceId,
        ownerId,
        name: 'Test Workspace',
        memberCount: 2,
      };

      const members = [
        {
          id: 'member-1',
          workspaceId,
          userId: 'user-1',
          user: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            picture: null,
          },
          role: WorkspaceMemberRole.MEMBER,
          joinedAt: new Date('2024-01-01'),
        },
        {
          id: 'member-2',
          workspaceId,
          userId: 'user-2',
          user: {
            id: 'user-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            picture: null,
          },
          role: WorkspaceMemberRole.ADMIN,
          joinedAt: new Date('2024-01-02'),
        },
      ];

      workspaceRepository.findOne.mockResolvedValue(workspace);
      workspaceMemberRepository.find.mockResolvedValue(members);

      const result = await service.getMembers(workspaceId, ownerId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user-1');
      expect(result[0].email).toBe('john@example.com');
      expect(result[1].id).toBe('user-2');
      expect(result[1].email).toBe('jane@example.com');
    });

    it('should include user details and role', async () => {
      const workspaceId = 'workspace-1';
      const ownerId = 'owner-1';

      const workspace = {
        id: workspaceId,
        ownerId,
        name: 'Test Workspace',
        memberCount: 1,
      };

      const members = [
        {
          id: 'member-1',
          workspaceId,
          userId: 'user-1',
          user: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            picture: 'avatar.jpg',
          },
          role: WorkspaceMemberRole.MEMBER,
          joinedAt: new Date('2024-01-01'),
          lastActiveAt: new Date(), // Set to current time to make member active
        },
      ];

      workspaceRepository.findOne.mockResolvedValue(workspace);
      workspaceMemberRepository.find.mockResolvedValue(members);

      const result = await service.getMembers(workspaceId, ownerId);

      expect(result[0]).toEqual({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'avatar.jpg',
        role: WorkspaceMemberRole.MEMBER,
        joinedAt: new Date('2024-01-01'),
        status: 'active',
        lastActiveAt: expect.any(Date),
      });
    });

    it('should include joined_at timestamp', async () => {
      const workspaceId = 'workspace-1';
      const ownerId = 'owner-1';
      const joinedAt = new Date('2024-01-15T10:30:00Z');

      const workspace = {
        id: workspaceId,
        ownerId,
        name: 'Test Workspace',
        memberCount: 1,
      };

      const members = [
        {
          id: 'member-1',
          workspaceId,
          userId: 'user-1',
          user: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            picture: null,
          },
          role: WorkspaceMemberRole.MEMBER,
          joinedAt,
        },
      ];

      workspaceRepository.findOne.mockResolvedValue(workspace);
      workspaceMemberRepository.find.mockResolvedValue(members);

      const result = await service.getMembers(workspaceId, ownerId);

      expect(result[0].joinedAt).toEqual(joinedAt);
    });

    it('should order members by joined_at descending', async () => {
      const workspaceId = 'workspace-1';
      const ownerId = 'owner-1';

      const workspace = {
        id: workspaceId,
        ownerId,
        name: 'Test Workspace',
        memberCount: 3,
      };

      const members = [
        {
          id: 'member-3',
          workspaceId,
          userId: 'user-3',
          user: {
            id: 'user-3',
            firstName: 'Charlie',
            lastName: 'Brown',
            email: 'charlie@example.com',
            picture: null,
          },
          role: WorkspaceMemberRole.MEMBER,
          joinedAt: new Date('2024-01-03'),
        },
        {
          id: 'member-2',
          workspaceId,
          userId: 'user-2',
          user: {
            id: 'user-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            picture: null,
          },
          role: WorkspaceMemberRole.MEMBER,
          joinedAt: new Date('2024-01-02'),
        },
        {
          id: 'member-1',
          workspaceId,
          userId: 'user-1',
          user: {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            picture: null,
          },
          role: WorkspaceMemberRole.MEMBER,
          joinedAt: new Date('2024-01-01'),
        },
      ];

      workspaceRepository.findOne.mockResolvedValue(workspace);
      workspaceMemberRepository.find.mockResolvedValue(members);

      const result = await service.getMembers(workspaceId, ownerId);

      expect(result[0].name).toBe('Charlie Brown');
      expect(result[1].name).toBe('Jane Smith');
      expect(result[2].name).toBe('John Doe');
    });

    it('should return empty array when no members', async () => {
      const workspaceId = 'workspace-1';
      const ownerId = 'owner-1';

      const workspace = {
        id: workspaceId,
        ownerId,
        name: 'Test Workspace',
        memberCount: 0,
      };

      workspaceRepository.findOne.mockResolvedValue(workspace);
      workspaceMemberRepository.find.mockResolvedValue([]);

      const result = await service.getMembers(workspaceId, ownerId);

      expect(result).toEqual([]);
    });
  });
});
