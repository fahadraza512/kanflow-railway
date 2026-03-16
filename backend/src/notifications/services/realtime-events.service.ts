import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsGateway } from '../gateways/events.gateway';

export interface WorkspaceMemberAddedEvent {
  workspaceId: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  timestamp: string;
}

export interface DashboardWorkspaceAddedEvent {
  userId: string;
  workspace: {
    id: string;
    name: string;
    memberCount: number;
  };
  timestamp: string;
}

@Injectable()
export class RealtimeEventsService {
  private readonly logger = new Logger(RealtimeEventsService.name);

  constructor(
    private eventsGateway: EventsGateway,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Emit workspace:member:added event
   * Broadcast to workspace owner and all workspace members
   */
  emitWorkspaceMemberAdded(event: WorkspaceMemberAddedEvent): void {
    this.logger.log(
      `Emitting workspace:member:added for workspace ${event.workspaceId}, user ${event.userId}`,
    );

    // Emit to NestJS event emitter for internal listeners
    this.eventEmitter.emit('workspace.member.added', event);

    // Emit to gateway subscribers
    const eventName = `workspace:${event.workspaceId}:member:added`;
    this.eventsGateway.emit(eventName, event);
  }

  /**
   * Emit dashboard:workspace:added event
   * Broadcast to newly joined user
   */
  emitDashboardWorkspaceAdded(event: DashboardWorkspaceAddedEvent): void {
    this.logger.log(
      `Emitting dashboard:workspace:added for user ${event.userId}, workspace ${event.workspace.id}`,
    );

    // Emit to NestJS event emitter for internal listeners
    this.eventEmitter.emit('dashboard.workspace.added', event);

    // Emit to gateway subscribers
    const eventName = `user:${event.userId}:workspace:added`;
    this.eventsGateway.emit(eventName, event);
  }

  /**
   * Subscribe to workspace member added events
   */
  subscribeToWorkspaceMemberAdded(
    workspaceId: string,
    callback: (event: WorkspaceMemberAddedEvent) => void,
  ): () => void {
    const eventName = `workspace:${workspaceId}:member:added`;
    return this.eventsGateway.subscribe(eventName, callback);
  }

  /**
   * Subscribe to dashboard workspace added events
   */
  subscribeToDashboardWorkspaceAdded(
    userId: string,
    callback: (event: DashboardWorkspaceAddedEvent) => void,
  ): () => void {
    const eventName = `user:${userId}:workspace:added`;
    return this.eventsGateway.subscribe(eventName, callback);
  }

  /**
   * Get subscriber count for workspace member added events
   */
  getWorkspaceMemberAddedSubscriberCount(workspaceId: string): number {
    const eventName = `workspace:${workspaceId}:member:added`;
    return this.eventsGateway.getSubscriberCount(eventName);
  }

  /**
   * Get subscriber count for dashboard workspace added events
   */
  getDashboardWorkspaceAddedSubscriberCount(userId: string): number {
    const eventName = `user:${userId}:workspace:added`;
    return this.eventsGateway.getSubscriberCount(eventName);
  }
}
