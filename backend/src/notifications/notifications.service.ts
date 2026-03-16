import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Preference } from '../preferences/entities/preference.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { User } from '../auth/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Preference)
    private preferenceRepository: Repository<Preference>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
    private emailService: EmailService,
  ) {}

  /**
   * Check if user has enabled notifications for a specific type
   */
  private async shouldNotify(userId: string, notificationType: string, workspaceId?: string): Promise<boolean> {
    // Payment alerts are ONLY for workspace owners
    const paymentAlertTypes = [
      'payment_failed',
      'payment_succeeded', 
      'subscription_expiring',
      'subscription_expired',
      'subscription_renewed',
      'invoice_payment_failed',
      'invoice_payment_succeeded',
    ];

    if (paymentAlertTypes.includes(notificationType)) {
      // If no workspaceId provided, cannot verify ownership - deny notification
      if (!workspaceId) {
        console.log(`[NotificationsService] Skipping payment alert for user ${userId} - no workspaceId provided`);
        return false;
      }

      // Check if user is the workspace owner
      const workspace = await this.workspaceRepository.findOne({
        where: { id: workspaceId },
        select: ['ownerId'],
      });

      if (!workspace || workspace.ownerId !== userId) {
        console.log(`[NotificationsService] Skipping payment alert for user ${userId} - not workspace owner`);
        return false;
      }

      // Owner verified - now check their payment alert preference
      const preference = await this.preferenceRepository.findOne({
        where: { userId },
      });

      // If no preferences found, allow payment alerts for owners (default behavior)
      if (!preference) {
        return true;
      }

      // Check if owner has enabled payment alerts
      return preference.emailPaymentAlerts === true;
    }

    // For non-payment notifications, check regular preferences
    const preference = await this.preferenceRepository.findOne({
      where: { userId },
    });

    // If no preferences found, allow all notifications (default behavior)
    if (!preference) {
      return true;
    }

    // Map notification types to preference fields
    const typeToPreferenceMap: Record<string, keyof Preference> = {
      // Task assignments
      'task_assigned': 'emailAssignments',
      'task_unassigned': 'emailAssignments',
      
      // Comments and mentions
      'task_commented': 'emailComments',
      'comment_mention': 'emailMentions',
      'comment_reply': 'emailComments',
      
      // Deadlines
      'task_due_soon': 'emailDeadlines',
      
      // Other task notifications (status, delete, move)
      'task_status_changed': 'emailAssignments',
      'task_deleted': 'emailAssignments',
      'task_moved': 'emailAssignments',
      
      // Board notifications
      'board_member_added': 'emailAssignments',
      'board_member_removed': 'emailAssignments',
      'board_created': 'emailAssignments',
      
      // Workspace notifications
      'workspace_invite': 'emailAssignments',
      'workspace_role_changed': 'emailAssignments',
      'workspace_member_joined': 'emailAssignments',
    };

    const preferenceField = typeToPreferenceMap[notificationType];
    
    // If no mapping found, allow notification (default behavior)
    if (!preferenceField) {
      return true;
    }

    // Check if user has enabled this notification type
    return preference[preferenceField] === true;
  }

  async create(createNotificationDto: CreateNotificationDto) {
    // Check if user wants to receive this type of notification
    const shouldCreate = await this.shouldNotify(
      createNotificationDto.userId,
      createNotificationDto.type,
      createNotificationDto.workspaceId,
    );

    if (!shouldCreate) {
      console.log(`[NotificationsService] Skipping notification for user ${createNotificationDto.userId} - preference disabled for type ${createNotificationDto.type}`);
      return null;
    }

    // Create in-app notification
    const notification = this.notificationRepository.create(createNotificationDto);
    const savedNotification = await this.notificationRepository.save(notification);

    // Emit event for SSE (real-time in-app notification)
    this.eventEmitter.emit('notification.created', savedNotification);

    // Send email notification
    try {
      await this.sendEmailNotification(savedNotification);
    } catch (error) {
      // Log error but don't fail notification creation
      console.error('[NotificationsService] Failed to send email notification:', error.message);
    }

    return savedNotification;
  }

  /**
   * Send email notification to user
   */
  private async sendEmailNotification(notification: Notification) {
    try {
      // Get user email
      const user = await this.userRepository.findOne({
        where: { id: notification.userId },
        select: ['email', 'firstName', 'lastName'],
      });

      if (!user || !user.email) {
        console.log(`[NotificationsService] No email found for user ${notification.userId}`);
        return;
      }

      const userName = `${user.firstName} ${user.lastName}`.trim();

      // Get workspace name if available
      let workspaceName = 'Your Workspace';
      if (notification.workspaceId) {
        const workspace = await this.workspaceRepository.findOne({
          where: { id: notification.workspaceId },
          select: ['name'],
        });
        if (workspace) {
          workspaceName = workspace.name;
        }
      }

      // Generate action URL
      const actionUrl = this.getNotificationActionUrl(notification);

      // Send email
      await this.emailService.sendNotificationEmail(
        user.email,
        {
          type: notification.type,
          title: notification.title,
          message: notification.message,
          workspaceName,
          actionUrl,
          userName,
        }
      );

      console.log(`[NotificationsService] Email sent to ${user.email} for notification ${notification.id}`);
    } catch (error) {
      console.error('[NotificationsService] Error sending email:', error);
      throw error;
    }
  }

  /**
   * Generate action URL for notification
   */
  private getNotificationActionUrl(notification: Notification): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    switch (notification.type) {
      // Task notifications
      case 'task_assigned':
      case 'task_unassigned':
      case 'task_status_changed':
      case 'task_due_soon':
      case 'task_deleted':
      case 'task_moved':
        return `${baseUrl}/dashboard?taskId=${notification.relatedEntityId}`;
      
      // Comment notifications
      case 'task_commented':
      case 'comment_mention':
      case 'comment_reply':
        if (notification.metadata?.taskId) {
          return `${baseUrl}/dashboard?taskId=${notification.metadata.taskId}&commentId=${notification.relatedEntityId}`;
        }
        return `${baseUrl}/dashboard?commentId=${notification.relatedEntityId}`;
      
      // Board notifications
      case 'board_member_added':
      case 'board_member_removed':
      case 'board_created':
        if (notification.workspaceId && notification.metadata?.projectId) {
          return `${baseUrl}/workspaces/${notification.workspaceId}/projects/${notification.metadata.projectId}/boards/${notification.relatedEntityId}`;
        }
        return `${baseUrl}/dashboard`;
      
      // Workspace notifications
      case 'workspace_invite':
        return `${baseUrl}/invite/accept?token=${notification.relatedEntityId}`;
      
      case 'workspace_role_changed':
      case 'workspace_member_joined':
        return `${baseUrl}/settings/members`;
      
      // Payment notifications
      case 'payment_failed':
      case 'payment_succeeded':
      case 'subscription_expiring':
      case 'subscription_expired':
      case 'subscription_renewed':
        return `${baseUrl}/settings/billing`;
      
      default:
        return `${baseUrl}/notifications`;
    }
  }

  async findAll(userId: string, limit: number = 50) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findUnread(userId: string) {
    return this.notificationRepository.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(userId: string, workspaceId?: string) {
    const where: any = { userId, isRead: false };
    
    // If workspaceId is provided, filter by workspace
    if (workspaceId) {
      where.workspaceId = workspaceId;
    }
    
    return this.notificationRepository.count({ where });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      return { message: 'Notification not found' };
    }

    notification.isRead = true;
    await this.notificationRepository.save(notification);

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );

    return { message: 'All notifications marked as read' };
  }

  async clearAll(userId: string, workspaceId?: string) {
    const where: any = { userId };
    
    // If workspaceId is provided, only delete notifications for that workspace
    if (workspaceId) {
      where.workspaceId = workspaceId;
    }
    
    await this.notificationRepository.delete(where);

    return { message: 'All notifications cleared' };
  }

  async remove(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      return { message: 'Notification not found' };
    }

    await this.notificationRepository.remove(notification);
    return { message: 'Notification deleted successfully' };
  }

  // Helper methods for creating specific notification types
  
  // ============ TASK NOTIFICATIONS ============
  
  async notifyTaskAssigned(taskId: string, assigneeId: string, assignerName: string, taskTitle?: string, workspaceId?: string) {
    return this.create({
      type: 'task_assigned',
      title: 'Task Assigned',
      message: taskTitle 
        ? `${assignerName} assigned you "${taskTitle}"`
        : `${assignerName} assigned you a task`,
      userId: assigneeId,
      relatedEntityId: taskId,
      relatedEntityType: 'task',
      workspaceId,
    });
  }

  async notifyTaskUnassigned(taskId: string, previousAssigneeId: string, unassignerName: string, taskTitle?: string, workspaceId?: string) {
    return this.create({
      type: 'task_unassigned',
      title: 'Task Unassigned',
      message: taskTitle 
        ? `${unassignerName} unassigned you from "${taskTitle}"`
        : `${unassignerName} unassigned you from a task`,
      userId: previousAssigneeId,
      relatedEntityId: taskId,
      relatedEntityType: 'task',
      workspaceId,
    });
  }

  async notifyTaskStatusChanged(taskId: string, userIds: string[], changerName: string, taskTitle: string, oldStatus: string, newStatus: string, workspaceId?: string) {
    const promises = userIds.map(userId =>
      this.create({
        type: 'task_status_changed',
        title: 'Task Status Updated',
        message: `${changerName} moved "${taskTitle}" from ${oldStatus} to ${newStatus}`,
        userId,
        relatedEntityId: taskId,
        relatedEntityType: 'task',
        workspaceId,
        metadata: { oldStatus, newStatus },
      })
    );
    return Promise.all(promises);
  }

  async notifyTaskDueSoon(taskId: string, userId: string, taskTitle: string, workspaceId?: string) {
    return this.create({
      type: 'task_due_soon',
      title: 'Task Due Soon',
      message: `Task "${taskTitle}" is due within 24 hours`,
      userId,
      relatedEntityId: taskId,
      relatedEntityType: 'task',
      workspaceId,
    });
  }

  async notifyTaskDeleted(taskId: string, userIds: string[], deleterName: string, taskTitle: string, workspaceId?: string) {
    const promises = userIds.map(userId =>
      this.create({
        type: 'task_deleted',
        title: 'Task Deleted',
        message: `${deleterName} deleted task "${taskTitle}"`,
        userId,
        relatedEntityId: taskId,
        relatedEntityType: 'task',
        workspaceId,
      })
    );
    return Promise.all(promises);
  }

  async notifyTaskMoved(taskId: string, userIds: string[], moverName: string, taskTitle: string, fromBoard: string, toBoard: string, workspaceId?: string) {
    const promises = userIds.map(userId =>
      this.create({
        type: 'task_moved',
        title: 'Task Moved',
        message: `${moverName} moved "${taskTitle}" from ${fromBoard} to ${toBoard}`,
        userId,
        relatedEntityId: taskId,
        relatedEntityType: 'task',
        workspaceId,
        metadata: { fromBoard, toBoard },
      })
    );
    return Promise.all(promises);
  }

  // ============ COMMENT NOTIFICATIONS ============

  async notifyTaskCommented(commentId: string, taskId: string, userIds: string[], commenterName: string, taskTitle: string, workspaceId?: string) {
    const promises = userIds.map(userId =>
      this.create({
        type: 'task_commented',
        title: 'New Comment',
        message: `${commenterName} commented on "${taskTitle}"`,
        userId,
        relatedEntityId: commentId,
        relatedEntityType: 'comment',
        workspaceId,
        metadata: { taskId },
      })
    );
    return Promise.all(promises);
  }

  async notifyCommentMention(commentId: string, mentionedUserId: string, commenterName: string, workspaceId?: string) {
    return this.create({
      type: 'comment_mention',
      title: 'Mentioned in Comment',
      message: `${commenterName} mentioned you in a comment`,
      userId: mentionedUserId,
      relatedEntityId: commentId,
      relatedEntityType: 'comment',
      workspaceId,
    });
  }

  async notifyCommentReply(commentId: string, originalCommenterId: string, replierName: string, taskTitle: string, workspaceId?: string) {
    return this.create({
      type: 'comment_reply',
      title: 'Reply to Your Comment',
      message: `${replierName} replied to your comment on "${taskTitle}"`,
      userId: originalCommenterId,
      relatedEntityId: commentId,
      relatedEntityType: 'comment',
      workspaceId,
    });
  }

  // ============ BOARD NOTIFICATIONS ============

  async notifyBoardMemberAdded(boardId: string, userId: string, adderName: string, boardName: string, workspaceId?: string, projectId?: string) {
    return this.create({
      type: 'board_member_added',
      title: 'Added to Board',
      message: `${adderName} added you to board "${boardName}"`,
      userId,
      relatedEntityId: boardId,
      relatedEntityType: 'board',
      workspaceId,
      metadata: { projectId },
    });
  }

  async notifyBoardMemberRemoved(boardId: string, userId: string, removerName: string, boardName: string, workspaceId?: string, projectId?: string) {
    return this.create({
      type: 'board_member_removed',
      title: 'Removed from Board',
      message: `${removerName} removed you from board "${boardName}"`,
      userId,
      relatedEntityId: boardId,
      relatedEntityType: 'board',
      workspaceId,
      metadata: { projectId },
    });
  }

  async notifyBoardCreated(boardId: string, userIds: string[], creatorName: string, boardName: string, workspaceId?: string, projectId?: string) {
    const promises = userIds.map(userId =>
      this.create({
        type: 'board_created',
        title: 'New Board Created',
        message: `${creatorName} created a new board "${boardName}"`,
        userId,
        relatedEntityId: boardId,
        relatedEntityType: 'board',
        workspaceId,
        metadata: { projectId },
      })
    );
    return Promise.all(promises);
  }

  // ============ WORKSPACE NOTIFICATIONS ============

  async notifyWorkspaceInvite(invitationId: string, userId: string, inviterName: string, workspaceName: string, workspaceId?: string) {
    return this.create({
      type: 'workspace_invite',
      title: 'Workspace Invitation',
      message: `${inviterName} invited you to join "${workspaceName}"`,
      userId,
      relatedEntityId: invitationId,
      relatedEntityType: 'invitation',
      workspaceId,
    });
  }

  async notifyWorkspaceRoleChanged(userId: string, changerName: string, workspaceName: string, oldRole: string, newRole: string, workspaceId?: string) {
    return this.create({
      type: 'workspace_role_changed',
      title: 'Role Updated',
      message: `${changerName} changed your role in "${workspaceName}" from ${oldRole} to ${newRole}`,
      userId,
      relatedEntityId: workspaceId,
      relatedEntityType: 'workspace',
      workspaceId,
      metadata: { oldRole, newRole },
    });
  }

  async notifyWorkspaceMemberJoined(workspaceId: string, ownerId: string, newMemberName: string, workspaceName: string) {
    return this.create({
      type: 'workspace_member_joined',
      title: 'New Member Joined',
      message: `${newMemberName} joined your workspace "${workspaceName}"`,
      userId: ownerId,
      relatedEntityId: workspaceId,
      relatedEntityType: 'workspace',
      workspaceId,
    });
  }

  // ============ PAYMENT ALERT NOTIFICATIONS (OWNER ONLY) ============

  async notifyPaymentFailed(workspaceId: string, ownerId: string, workspaceName: string, amount?: string) {
    return this.create({
      type: 'payment_failed',
      title: 'Payment Failed',
      message: amount 
        ? `Payment of ${amount} failed for workspace "${workspaceName}"`
        : `Payment failed for workspace "${workspaceName}"`,
      userId: ownerId,
      relatedEntityId: workspaceId,
      relatedEntityType: 'workspace',
      workspaceId,
    });
  }

  async notifyPaymentSucceeded(workspaceId: string, ownerId: string, workspaceName: string, amount?: string) {
    return this.create({
      type: 'payment_succeeded',
      title: 'Payment Successful',
      message: amount 
        ? `Payment of ${amount} processed successfully for workspace "${workspaceName}"`
        : `Payment processed successfully for workspace "${workspaceName}"`,
      userId: ownerId,
      relatedEntityId: workspaceId,
      relatedEntityType: 'workspace',
      workspaceId,
    });
  }

  async notifySubscriptionExpiring(workspaceId: string, ownerId: string, workspaceName: string, daysRemaining: number) {
    return this.create({
      type: 'subscription_expiring',
      title: 'Subscription Expiring Soon',
      message: `Your subscription for workspace "${workspaceName}" will expire in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`,
      userId: ownerId,
      relatedEntityId: workspaceId,
      relatedEntityType: 'workspace',
      workspaceId,
      metadata: { daysRemaining },
    });
  }

  async notifySubscriptionExpired(workspaceId: string, ownerId: string, workspaceName: string) {
    return this.create({
      type: 'subscription_expired',
      title: 'Subscription Expired',
      message: `Your subscription for workspace "${workspaceName}" has expired`,
      userId: ownerId,
      relatedEntityId: workspaceId,
      relatedEntityType: 'workspace',
      workspaceId,
    });
  }

  async notifySubscriptionRenewed(workspaceId: string, ownerId: string, workspaceName: string) {
    return this.create({
      type: 'subscription_renewed',
      title: 'Subscription Renewed',
      message: `Your subscription for workspace "${workspaceName}" has been renewed`,
      userId: ownerId,
      relatedEntityId: workspaceId,
      relatedEntityType: 'workspace',
      workspaceId,
    });
  }
}
