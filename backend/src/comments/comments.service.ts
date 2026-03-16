import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { TasksService } from '../tasks/tasks.service';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../auth/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Board } from '../boards/entities/board.entity';
import { PermissionsService } from '../common/permissions/permissions.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private tasksService: TasksService,
    private notificationsService: NotificationsService,
    private permissionsService: PermissionsService,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    // Verify user has access to the task
    await this.tasksService.findOne(createCommentDto.taskId, userId);

    // All roles (including viewer) can add comments
    // No additional role check needed here

    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId,
    });

    const saved = await this.commentRepository.save(comment);
    
    // Get commenter info and task details for notifications
    try {
      const commenter = await this.userRepository.findOne({ where: { id: userId } });
      const commenterName = commenter ? `${commenter.firstName} ${commenter.lastName}` : 'Someone';
      
      // Get task with workspace info and creator/assignee
      const task = await this.taskRepository.findOne({
        where: { id: createCommentDto.taskId },
        relations: ['board', 'board.project', 'assignee'],
      });
      
      const workspaceId = task?.board?.project?.workspaceId;
      
      // Collect users to notify about the comment (assignee only, since we don't have createdBy)
      const notifyUserIds: string[] = [];
      
      if (task?.assigneeId && task.assigneeId !== userId) {
        notifyUserIds.push(task.assigneeId);
      }
      
      // Remove duplicates
      const uniqueUserIds = [...new Set(notifyUserIds)];
      
      // Send comment notification
      if (uniqueUserIds.length > 0 && task) {
        await this.notificationsService.notifyTaskCommented(
          saved.id,
          task.id,
          uniqueUserIds,
          commenterName,
          task.title,
          workspaceId,
        );
      }
      
      // Send mention notifications
      if (createCommentDto.mentions && createCommentDto.mentions.length > 0) {
        for (const mentionedUserId of createCommentDto.mentions) {
          // Don't notify if user mentions themselves
          if (mentionedUserId !== userId) {
            await this.notificationsService.notifyCommentMention(
              saved.id,
              mentionedUserId,
              commenterName,
              workspaceId,
            );
          }
        }
      }
    } catch (error) {
      // Log error but don't fail comment creation
      console.error('Failed to send comment notifications:', error);
    }
    
    // Load user relation for response
    return this.commentRepository.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
  }

  async findByTask(taskId: string, userId: string) {
    // Verify user has access to the task
    await this.tasksService.findOne(taskId, userId);

    return this.commentRepository.find({
      where: { taskId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'task'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Verify user has access to the task
    await this.tasksService.findOne(comment.taskId, userId);

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.findOne(id, userId);

    // Only the comment author can update it
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    Object.assign(comment, updateCommentDto);
    const updated = await this.commentRepository.save(comment);
    
    // Reload with relations
    return this.commentRepository.findOne({
      where: { id: updated.id },
      relations: ['user'],
    });
  }

  async remove(id: string, userId: string) {
    const comment = await this.findOne(id, userId);

    // Get workspaceId to check if user is PM+
    const task = await this.taskRepository.findOne({
      where: { id: comment.taskId },
      relations: ['board', 'board.project'],
    });
    const workspaceId = task?.board?.project?.workspaceId;

    // PM+ can delete any comment; others can only delete their own
    if (comment.userId !== userId) {
      if (workspaceId) {
        await this.permissionsService.requireRole(userId, workspaceId, 'pm');
      } else {
        throw new ForbiddenException('You can only delete your own comments');
      }
    }

    await this.commentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}
