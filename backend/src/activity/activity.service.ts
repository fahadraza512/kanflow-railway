import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async create(activityData: Partial<Activity>) {
    const activity = this.activityRepository.create(activityData);
    return this.activityRepository.save(activity);
  }

  async findAll(filters: {
    workspaceId?: string;
    projectId?: string;
    userId?: string;
    resourceType?: string;
    limit?: number;
  }) {
    const query = this.activityRepository.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .orderBy('activity.createdAt', 'DESC');

    if (filters.workspaceId) {
      query.andWhere('activity.workspaceId = :workspaceId', { workspaceId: filters.workspaceId });
    }

    if (filters.projectId) {
      query.andWhere('activity.projectId = :projectId', { projectId: filters.projectId });
    }

    if (filters.userId) {
      query.andWhere('activity.userId = :userId', { userId: filters.userId });
    }

    if (filters.resourceType) {
      query.andWhere('activity.resourceType = :resourceType', { resourceType: filters.resourceType });
    }

    if (filters.limit) {
      query.take(filters.limit);
    } else {
      query.take(50); // Default limit
    }

    return query.getMany();
  }

  async findByResource(resourceType: string, resourceId: string) {
    return this.activityRepository.find({
      where: { resourceType, resourceId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  // Helper methods for common activities
  async logTaskCreated(taskId: string, taskTitle: string, userId: string, projectId: string, workspaceId: string) {
    return this.create({
      action: 'created',
      resourceType: 'task',
      resourceId: taskId,
      resourceName: taskTitle,
      userId,
      projectId,
      workspaceId,
      description: `created task "${taskTitle}"`,
    });
  }

  async logTaskUpdated(taskId: string, taskTitle: string, userId: string, changes: any, projectId: string, workspaceId: string) {
    return this.create({
      action: 'updated',
      resourceType: 'task',
      resourceId: taskId,
      resourceName: taskTitle,
      userId,
      projectId,
      workspaceId,
      metadata: changes,
      description: `updated task "${taskTitle}"`,
    });
  }

  async logTaskMoved(taskId: string, taskTitle: string, userId: string, fromBoard: string, toBoard: string, projectId: string, workspaceId: string) {
    return this.create({
      action: 'moved',
      resourceType: 'task',
      resourceId: taskId,
      resourceName: taskTitle,
      userId,
      projectId,
      workspaceId,
      metadata: { fromBoard, toBoard },
      description: `moved task "${taskTitle}" from ${fromBoard} to ${toBoard}`,
    });
  }

  async logCommentAdded(commentId: string, taskId: string, userId: string, projectId: string, workspaceId: string) {
    return this.create({
      action: 'commented',
      resourceType: 'comment',
      resourceId: commentId,
      userId,
      projectId,
      workspaceId,
      metadata: { taskId },
      description: 'added a comment',
    });
  }
}
