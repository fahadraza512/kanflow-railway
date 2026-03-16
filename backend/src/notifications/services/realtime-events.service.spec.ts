import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RealtimeEventsService, WorkspaceMemberAddedEvent, DashboardWorkspaceAddedEvent } from './realtime-events.service';
import { EventsGateway } from '../gateways/events.gateway';

describe('RealtimeEventsService', () => {
  let service: RealtimeEventsService;
  let gateway: EventsGateway;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeEventsService,
        EventsGateway,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RealtimeEventsService>(RealtimeEventsService);
    gateway = module.get<EventsGateway>(EventsGateway);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('emitWorkspaceMemberAdded', () => {
    it('should emit workspace:member:added event with correct payload', () => {
      const event: WorkspaceMemberAddedEvent = {
        workspaceId: 'workspace-1',
        userId: 'user-1',
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'John Doe',
        },
        timestamp: new Date().toISOString(),
      };

      const gatewaySpy = jest.spyOn(gateway, 'emit');
      const emitterSpy = jest.spyOn(eventEmitter, 'emit');

      service.emitWorkspaceMemberAdded(event);

      expect(emitterSpy).toHaveBeenCalledWith('workspace.member.added', event);
      expect(gatewaySpy).toHaveBeenCalledWith('workspace:workspace-1:member:added', event);
    });

    it('should emit event with correct workspace ID in event name', () => {
      const event: WorkspaceMemberAddedEvent = {
        workspaceId: 'workspace-123',
        userId: 'user-456',
        user: {
          id: 'user-456',
          email: 'test@example.com',
          name: 'Test User',
        },
        timestamp: new Date().toISOString(),
      };

      const gatewaySpy = jest.spyOn(gateway, 'emit');

      service.emitWorkspaceMemberAdded(event);

      expect(gatewaySpy).toHaveBeenCalledWith('workspace:workspace-123:member:added', event);
    });
  });

  describe('emitDashboardWorkspaceAdded', () => {
    it('should emit dashboard:workspace:added event with correct payload', () => {
      const event: DashboardWorkspaceAddedEvent = {
        userId: 'user-1',
        workspace: {
          id: 'workspace-1',
          name: 'My Workspace',
          memberCount: 5,
        },
        timestamp: new Date().toISOString(),
      };

      const gatewaySpy = jest.spyOn(gateway, 'emit');
      const emitterSpy = jest.spyOn(eventEmitter, 'emit');

      service.emitDashboardWorkspaceAdded(event);

      expect(emitterSpy).toHaveBeenCalledWith('dashboard.workspace.added', event);
      expect(gatewaySpy).toHaveBeenCalledWith('user:user-1:workspace:added', event);
    });

    it('should emit event with correct user ID in event name', () => {
      const event: DashboardWorkspaceAddedEvent = {
        userId: 'user-789',
        workspace: {
          id: 'workspace-456',
          name: 'Test Workspace',
          memberCount: 3,
        },
        timestamp: new Date().toISOString(),
      };

      const gatewaySpy = jest.spyOn(gateway, 'emit');

      service.emitDashboardWorkspaceAdded(event);

      expect(gatewaySpy).toHaveBeenCalledWith('user:user-789:workspace:added', event);
    });
  });

  describe('subscribeToWorkspaceMemberAdded', () => {
    it('should subscribe to workspace member added events', () => {
      const callback = jest.fn();
      const workspaceId = 'workspace-1';

      const unsubscribe = service.subscribeToWorkspaceMemberAdded(workspaceId, callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback when event is emitted', () => {
      const callback = jest.fn();
      const workspaceId = 'workspace-1';

      service.subscribeToWorkspaceMemberAdded(workspaceId, callback);

      const event: WorkspaceMemberAddedEvent = {
        workspaceId,
        userId: 'user-1',
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'John Doe',
        },
        timestamp: new Date().toISOString(),
      };

      service.emitWorkspaceMemberAdded(event);

      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe when unsubscribe function is called', () => {
      const callback = jest.fn();
      const workspaceId = 'workspace-1';

      const unsubscribe = service.subscribeToWorkspaceMemberAdded(workspaceId, callback);
      unsubscribe();

      const event: WorkspaceMemberAddedEvent = {
        workspaceId,
        userId: 'user-1',
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'John Doe',
        },
        timestamp: new Date().toISOString(),
      };

      service.emitWorkspaceMemberAdded(event);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToDashboardWorkspaceAdded', () => {
    it('should subscribe to dashboard workspace added events', () => {
      const callback = jest.fn();
      const userId = 'user-1';

      const unsubscribe = service.subscribeToDashboardWorkspaceAdded(userId, callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback when event is emitted', () => {
      const callback = jest.fn();
      const userId = 'user-1';

      service.subscribeToDashboardWorkspaceAdded(userId, callback);

      const event: DashboardWorkspaceAddedEvent = {
        userId,
        workspace: {
          id: 'workspace-1',
          name: 'My Workspace',
          memberCount: 5,
        },
        timestamp: new Date().toISOString(),
      };

      service.emitDashboardWorkspaceAdded(event);

      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe when unsubscribe function is called', () => {
      const callback = jest.fn();
      const userId = 'user-1';

      const unsubscribe = service.subscribeToDashboardWorkspaceAdded(userId, callback);
      unsubscribe();

      const event: DashboardWorkspaceAddedEvent = {
        userId,
        workspace: {
          id: 'workspace-1',
          name: 'My Workspace',
          memberCount: 5,
        },
        timestamp: new Date().toISOString(),
      };

      service.emitDashboardWorkspaceAdded(event);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getWorkspaceMemberAddedSubscriberCount', () => {
    it('should return correct subscriber count', () => {
      const workspaceId = 'workspace-1';
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      service.subscribeToWorkspaceMemberAdded(workspaceId, callback1);
      service.subscribeToWorkspaceMemberAdded(workspaceId, callback2);

      const count = service.getWorkspaceMemberAddedSubscriberCount(workspaceId);

      expect(count).toBe(2);
    });

    it('should return 0 when no subscribers', () => {
      const count = service.getWorkspaceMemberAddedSubscriberCount('workspace-nonexistent');

      expect(count).toBe(0);
    });
  });

  describe('getDashboardWorkspaceAddedSubscriberCount', () => {
    it('should return correct subscriber count', () => {
      const userId = 'user-1';
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      service.subscribeToDashboardWorkspaceAdded(userId, callback1);
      service.subscribeToDashboardWorkspaceAdded(userId, callback2);

      const count = service.getDashboardWorkspaceAddedSubscriberCount(userId);

      expect(count).toBe(2);
    });

    it('should return 0 when no subscribers', () => {
      const count = service.getDashboardWorkspaceAddedSubscriberCount('user-nonexistent');

      expect(count).toBe(0);
    });
  });
});
