import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../auth/entities/user.entity';
import { Board } from '../boards/entities/board.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { BulkOperationDto } from './dto/bulk-operation.dto';
import { BoardsService } from '../boards/boards.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private boardsService: BoardsService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private activityService: ActivityService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    // Check board access
    await this.boardsService.findOne(createTaskDto.boardId, userId);

    // Check for duplicate task title in the same board (case-insensitive)
    // Check both active and archived tasks
    const existingTask = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.boardId = :boardId', { boardId: createTaskDto.boardId })
      .andWhere('LOWER(task.title) = LOWER(:title)', { title: createTaskDto.title })
      .getOne();

    if (existingTask) {
      if (existingTask.isArchived) {
        throw new ConflictException('A task with this title exists in archive. Please delete it first or choose a different title.');
      }
      throw new ConflictException('A task with this title already exists in this board');
    }

    // Get max order
    const maxOrder = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.boardId = :boardId', { boardId: createTaskDto.boardId })
      .select('MAX(task.order)', 'max')
      .getRawOne();

    const task = this.taskRepository.create({
      ...createTaskDto,
      order: (maxOrder?.max || 0) + 1,
    });

    const savedTask = await this.taskRepository.save(task);

    // Get board with workspace and project info for notifications and activity
    const board = await this.boardRepository.findOne({
      where: { id: savedTask.boardId },
      relations: ['project'],
    });
    
    const workspaceId = board?.project?.workspaceId;
    const projectId = board?.projectId;

    // Log activity: Task created
    try {
      if (workspaceId && projectId) {
        await this.activityService.logTaskCreated(
          savedTask.id,
          savedTask.title,
          userId,
          projectId,
          workspaceId,
        );
      }
    } catch (error) {
      console.error('Failed to log task creation activity:', error);
    }

    // Send notification if task is assigned to someone
    if (savedTask.assigneeId && savedTask.assigneeId !== userId) {
      try {
        // Get assigner name
        const assigner = await this.userRepository.findOne({
          where: { id: userId },
          select: ['id', 'firstName', 'lastName'],
        });
        
        const assignerName = assigner 
          ? `${assigner.firstName} ${assigner.lastName}`.trim()
          : 'Someone';
        
        await this.notificationsService.notifyTaskAssigned(
          savedTask.id,
          savedTask.assigneeId,
          assignerName,
          savedTask.title,
          workspaceId,
        );
      } catch (error) {
        console.error('Failed to send task assignment notification:', error);
      }
    }

    return savedTask;
  }

  async findAll(boardId: string, userId: string) {
    // Check board access
    await this.boardsService.findOne(boardId, userId);

    return this.taskRepository.find({
      where: { boardId, isArchived: false },
      order: { order: 'ASC' },
      relations: ['assignee'],
    });
  }

  async findArchivedByWorkspace(workspaceId: string, userId: string) {
    // Get all boards in the workspace that user has access to
    const boards = await this.boardsService.findByWorkspace(workspaceId, userId);
    const boardIds = boards.map(board => board.id);

    if (boardIds.length === 0) {
      return [];
    }

    // Get all archived tasks from these boards with board and project info
    return this.taskRepository.find({
      where: { 
        boardId: In(boardIds),
        isArchived: true 
      },
      order: { updatedAt: 'DESC' },
      relations: ['assignee', 'board', 'board.project'],
    });
  }

  async findByWorkspace(workspaceId: string, userId: string) {
    // Get all boards in the workspace that user has access to
    const boards = await this.boardsService.findByWorkspace(workspaceId, userId);
    const boardIds = boards.map(board => board.id);

    if (boardIds.length === 0) {
      return [];
    }

    // Get all non-archived tasks from these boards
    return this.taskRepository.find({
      where: { 
        boardId: In(boardIds),
        isArchived: false 
      },
      order: { createdAt: 'DESC' },
      relations: ['assignee', 'board'],
    });
  }

  async findOverdue(workspaceId: string, userId: string) {
    console.log('[findOverdue] Finding overdue tasks for workspace:', workspaceId, 'user:', userId);
    
    // Get all overdue tasks in one optimized query
    const now = new Date();
    console.log('[findOverdue] Current time:', now);
    
    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.board', 'board')
      .leftJoinAndSelect('board.project', 'project')
      .where('project.workspaceId = :workspaceId', { workspaceId })
      .andWhere('task.isArchived = :isArchived', { isArchived: false })
      .andWhere('task.dueDate IS NOT NULL')
      .andWhere('task.dueDate < :now', { now })
      .andWhere('task.status != :status', { status: 'done' })
      .orderBy('task.dueDate', 'ASC')
      .getMany();

    console.log('[findOverdue] Found tasks:', tasks.length);
    if (tasks.length > 0) {
      console.log('[findOverdue] Sample task:', {
        id: tasks[0].id,
        title: tasks[0].title,
        dueDate: tasks[0].dueDate,
        status: tasks[0].status,
      });
    }

    return tasks;
  }

  async findOne(id: string, userId: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'board', 'board.project', 'board.project.workspace'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check board access
    await this.boardsService.findOne(task.boardId, userId);

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.findOne(id, userId);
    const oldAssignee = task.assigneeId;

    console.log('[TasksService.update] Received updateTaskDto:', JSON.stringify(updateTaskDto));
    console.log('[TasksService.update] Current task.assigneeId:', task.assigneeId);

    // Check for duplicate title if title is being updated (case-insensitive)
    // Check both active and archived tasks
    if (updateTaskDto.title && updateTaskDto.title.toLowerCase() !== task.title.toLowerCase()) {
      const existingTask = await this.taskRepository
        .createQueryBuilder('task')
        .where('task.boardId = :boardId', { boardId: task.boardId })
        .andWhere('LOWER(task.title) = LOWER(:title)', { title: updateTaskDto.title })
        .andWhere('task.id != :id', { id })
        .getOne();

      if (existingTask) {
        if (existingTask.isArchived) {
          throw new ConflictException('A task with this title exists in archive. Please delete it first or choose a different title.');
        }
        throw new ConflictException('A task with this title already exists in this board');
      }
    }

    // Handle null values explicitly (Object.assign skips null in some cases)
    Object.assign(task, updateTaskDto);
    
    // Explicitly set assigneeId to null if it's being unassigned
    if ('assigneeId' in updateTaskDto && updateTaskDto.assigneeId === null) {
      console.log('[TasksService.update] Setting assigneeId to null explicitly');
      task.assigneeId = null;
      task.assignee = null; // Also clear the relation to prevent stale data
    }
    
    console.log('[TasksService.update] Before save, task.assigneeId:', task.assigneeId);
    const updatedTask = await this.taskRepository.save(task);
    console.log('[TasksService.update] After save, updatedTask.assigneeId:', updatedTask.assigneeId);
    
    // Reload the task to get fresh relations after save
    const freshTask = await this.taskRepository.findOne({
      where: { id: updatedTask.id },
      relations: ['assignee', 'board'],
    });
    
    if (!freshTask) {
      throw new NotFoundException('Task not found after update');
    }
    
    console.log('[TasksService.update] After reload, freshTask.assigneeId:', freshTask.assigneeId, 'freshTask.assignee:', freshTask.assignee);

    // Get board with workspace info
    const board = await this.boardRepository.findOne({
      where: { id: freshTask.boardId },
      relations: ['project'],
    });
    
    const workspaceId = board?.project?.workspaceId;
    const projectId = board?.projectId;

    // Log activity: Task updated
    try {
      if (workspaceId && projectId) {
        const changes: any = {};
        if (updateTaskDto.title) changes.title = { old: task.title, new: updateTaskDto.title };
        if (updateTaskDto.status) changes.status = { old: task.status, new: updateTaskDto.status };
        if (updateTaskDto.priority) changes.priority = { old: task.priority, new: updateTaskDto.priority };
        if ('assigneeId' in updateTaskDto) changes.assignee = { old: oldAssignee, new: updateTaskDto.assigneeId };
        
        await this.activityService.logTaskUpdated(
          freshTask.id,
          freshTask.title,
          userId,
          changes,
          projectId,
          workspaceId,
        );
      }
    } catch (error) {
      console.error('Failed to log task update activity:', error);
    }

    // Send notifications for various task changes
    try {
      // Get user info for notifications
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName'],
      });
      
      const userName = user 
        ? `${user.firstName} ${user.lastName}`.trim()
        : 'Someone';

      // Notification: Task assigned
      if (updateTaskDto.assigneeId && updateTaskDto.assigneeId !== oldAssignee && updateTaskDto.assigneeId !== userId) {
        await this.notificationsService.notifyTaskAssigned(
          freshTask.id,
          updateTaskDto.assigneeId,
          userName,
          freshTask.title,
          workspaceId,
        );
      }

      // Notification: Task unassigned
      if (updateTaskDto.assigneeId === null && oldAssignee && oldAssignee !== userId) {
        await this.notificationsService.notifyTaskUnassigned(
          freshTask.id,
          oldAssignee,
          userName,
          freshTask.title,
          workspaceId,
        );
      }

      // Notification: Task status changed
      if (updateTaskDto.status && updateTaskDto.status !== task.status) {
        const notifyUserIds: string[] = [];
        
        // Notify assignee if exists and different from current user
        if (freshTask.assigneeId && freshTask.assigneeId !== userId) {
          notifyUserIds.push(freshTask.assigneeId);
        }
        
        // Remove duplicates
        const uniqueUserIds = [...new Set(notifyUserIds)];
        
        if (uniqueUserIds.length > 0) {
          await this.notificationsService.notifyTaskStatusChanged(
            freshTask.id,
            uniqueUserIds,
            userName,
            freshTask.title,
            task.status,
            updateTaskDto.status,
            workspaceId,
          );
        }
      }
    } catch (error) {
      console.error('Failed to send task update notifications:', error);
    }

    return freshTask;
  }

  async remove(id: string, userId: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['board', 'board.project'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check access
    await this.boardsService.findOne(task.boardId, userId);

    const workspaceId = task.board?.project?.workspaceId;
    const projectId = task.board?.projectId;

    // Log activity: Task deleted
    try {
      if (workspaceId && projectId) {
        await this.activityService.create({
          action: 'deleted',
          resourceType: 'task',
          resourceId: task.id,
          resourceName: task.title,
          userId,
          projectId,
          workspaceId,
          description: `deleted task "${task.title}"`,
        });
      }
    } catch (error) {
      console.error('Failed to log task deletion activity:', error);
    }

    // Send notification to assignee if exists
    if (task.assigneeId && task.assigneeId !== userId) {
      try {
        const deleter = await this.userRepository.findOne({
          where: { id: userId },
          select: ['id', 'firstName', 'lastName'],
        });
        
        const deleterName = deleter 
          ? `${deleter.firstName} ${deleter.lastName}`.trim()
          : 'Someone';
        
        await this.notificationsService.notifyTaskDeleted(
          task.id,
          [task.assigneeId],
          deleterName,
          task.title,
          workspaceId,
        );
      } catch (error) {
        console.error('Failed to send task deletion notification:', error);
      }
    }

    await this.taskRepository.remove(task);
    return { message: 'Task deleted successfully' };
  }

  async archive(id: string, userId: string) {
    const task = await this.findOne(id, userId);

    // Get board with workspace info for activity logging
    const board = await this.boardRepository.findOne({
      where: { id: task.boardId },
      relations: ['project'],
    });
    
    const workspaceId = board?.project?.workspaceId;
    const projectId = board?.projectId;

    task.isArchived = true;
    await this.taskRepository.save(task);

    // Log activity: Task archived
    try {
      if (workspaceId && projectId) {
        await this.activityService.create({
          action: 'archived',
          resourceType: 'task',
          resourceId: task.id,
          resourceName: task.title,
          userId,
          projectId,
          workspaceId,
          description: `archived task "${task.title}"`,
        });
      }
    } catch (error) {
      console.error('Failed to log task archive activity:', error);
    }

    return { message: 'Task archived successfully' };
  }

  async move(id: string, moveTaskDto: MoveTaskDto, userId: string) {
    const task = await this.findOne(id, userId);

    // Check target board access
    await this.boardsService.findOne(moveTaskDto.targetBoardId, userId);

    // Get max order in target board
    const maxOrder = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.boardId = :boardId', { boardId: moveTaskDto.targetBoardId })
      .select('MAX(task.order)', 'max')
      .getRawOne();

    task.boardId = moveTaskDto.targetBoardId;
    task.order = moveTaskDto.order !== undefined ? moveTaskDto.order : (maxOrder?.max || 0) + 1;

    await this.taskRepository.save(task);
    return { message: 'Task moved successfully' };
  }

  async bulkDelete(bulkOperationDto: BulkOperationDto, userId: string) {
    // Verify access to all tasks
    for (const taskId of bulkOperationDto.taskIds) {
      await this.findOne(taskId, userId);
    }

    await this.taskRepository.delete({ id: In(bulkOperationDto.taskIds) });
    return { message: `${bulkOperationDto.taskIds.length} tasks deleted successfully` };
  }

  async bulkArchive(bulkOperationDto: BulkOperationDto, userId: string) {
    // Verify access to all tasks
    for (const taskId of bulkOperationDto.taskIds) {
      await this.findOne(taskId, userId);
    }

    await this.taskRepository.update(
      { id: In(bulkOperationDto.taskIds) },
      { isArchived: true },
    );
    return { message: `${bulkOperationDto.taskIds.length} tasks archived successfully` };
  }

  async bulkMove(bulkOperationDto: BulkOperationDto, userId: string) {
    if (!bulkOperationDto.targetBoardId) {
      throw new NotFoundException('Target board ID is required for bulk move');
    }

    // Check target board access
    await this.boardsService.findOne(bulkOperationDto.targetBoardId, userId);

    // Verify access to all tasks
    for (const taskId of bulkOperationDto.taskIds) {
      await this.findOne(taskId, userId);
    }

    // Get max order in target board
    const maxOrder = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.boardId = :boardId', { boardId: bulkOperationDto.targetBoardId })
      .select('MAX(task.order)', 'max')
      .getRawOne();

    let currentOrder = (maxOrder?.max || 0) + 1;

    // Move all tasks
    for (const taskId of bulkOperationDto.taskIds) {
      await this.taskRepository.update(
        { id: taskId },
        { boardId: bulkOperationDto.targetBoardId, order: currentOrder++ },
      );
    }

    return { message: `${bulkOperationDto.taskIds.length} tasks moved successfully` };
  }
}
