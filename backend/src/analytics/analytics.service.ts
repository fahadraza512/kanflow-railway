import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, LessThan, Between } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { Board } from '../boards/entities/board.entity';
import { User } from '../auth/entities/user.entity';
import { List } from '../lists/entities/list.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(List)
    private listRepository: Repository<List>,
  ) {}

  async getWorkspaceAnalytics(workspaceId: string) {
    // Get all projects in workspace
    const projects = await this.projectRepository.find({
      where: { workspaceId, isArchived: false },
    });

    const projectIds = projects.map(p => p.id);

    // If no projects, return zeros
    if (projectIds.length === 0) {
      return {
        projects: {
          total: 0,
          active: 0,
        },
        boards: {
          total: 0,
        },
        tasks: {
          total: 0,
          completed: 0,
          inProgress: 0,
          todo: 0,
          overdue: 0,
          completionRate: 0,
        },
      };
    }

    // Get all boards in these projects
    const boards = await this.boardRepository.find({
      where: { projectId: In(projectIds), isArchived: false },
    });

    const boardIds = boards.map(b => b.id);

    // If no boards, return project/board counts but zero tasks
    if (boardIds.length === 0) {
      return {
        projects: {
          total: projects.length,
          active: projects.filter(p => !p.isArchived).length,
        },
        boards: {
          total: 0,
        },
        tasks: {
          total: 0,
          completed: 0,
          inProgress: 0,
          todo: 0,
          overdue: 0,
          completionRate: 0,
        },
      };
    }

    // Get task statistics
    const totalTasks = await this.taskRepository.count({
      where: { boardId: In(boardIds), isArchived: false },
    });

    const completedTasks = await this.taskRepository.count({
      where: { boardId: In(boardIds), status: 'done', isArchived: false },
    });

    // Count tasks by status
    const todoTasks = await this.taskRepository.count({
      where: { boardId: In(boardIds), status: 'todo', isArchived: false },
    });
    
    const inProgressTasks = await this.taskRepository.count({
      where: { boardId: In(boardIds), status: 'inProgress', isArchived: false },
    });
    
    const inReviewTasks = await this.taskRepository.count({
      where: { boardId: In(boardIds), status: 'inReview', isArchived: false },
    });

    // Get overdue tasks
    const overdueTasks = await this.taskRepository.count({
      where: {
        boardId: In(boardIds),
        isArchived: false,
        status: Not('done'),
        dueDate: LessThan(new Date()),
      },
    });

    // Get tasks by priority
    const tasksByPriority = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('task.boardId IN (:...boardIds)', { boardIds })
      .andWhere('task.isArchived = :isArchived', { isArchived: false })
      .groupBy('task.priority')
      .getRawMany();

    // Get tasks by status
    const tasksByStatus = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.boardId IN (:...boardIds)', { boardIds })
      .andWhere('task.isArchived = :isArchived', { isArchived: false })
      .groupBy('task.status')
      .getRawMany();

    // Get project stats (tasks per project)
    const projectStats = await Promise.all(
      projects.map(async (project) => {
        const projectBoards = boards.filter(b => b.projectId === project.id);
        const projectBoardIds = projectBoards.map(b => b.id);
        
        if (projectBoardIds.length === 0) {
          return {
            projectId: project.id,
            name: project.name,
            totalTasks: 0,
            completedTasks: 0,
            completionRate: 0,
          };
        }

        const projectTotalTasks = await this.taskRepository.count({
          where: { boardId: In(projectBoardIds), isArchived: false },
        });

        const projectCompletedTasks = await this.taskRepository.count({
          where: { boardId: In(projectBoardIds), status: 'done', isArchived: false },
        });

        return {
          projectId: project.id,
          name: project.name,
          totalTasks: projectTotalTasks,
          completedTasks: projectCompletedTasks,
          completionRate: projectTotalTasks > 0 ? (projectCompletedTasks / projectTotalTasks) * 100 : 0,
        };
      })
    );

    // Get team workload (tasks per assignee)
    const assignedTasksRaw = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.assigneeId', 'assigneeId')
      .addSelect('COUNT(*)', 'taskCount')
      .addSelect('SUM(CASE WHEN task.status = \'done\' THEN 1 ELSE 0 END)', 'completedCount')
      .where('task.boardId IN (:...boardIds)', { boardIds })
      .andWhere('task.isArchived = :isArchived', { isArchived: false })
      .andWhere('task.assigneeId IS NOT NULL')
      .groupBy('task.assigneeId')
      .getRawMany();

    const assigneeIds = assignedTasksRaw.map(r => r.assigneeId).filter(Boolean);
    const assignees = assigneeIds.length > 0
      ? await this.userRepository.findBy({ id: In(assigneeIds) })
      : [];

    const teamWorkload = assignedTasksRaw.map(row => {
      const user = assignees.find(u => u.id === row.assigneeId);
      return {
        userId: row.assigneeId,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        taskCount: parseInt(row.taskCount) || 0,
        completedCount: parseInt(row.completedCount) || 0,
      };
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentActivity = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(sevenDaysAgo);
        date.setDate(date.getDate() + i);
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        return { date, start, end };
      }).map(async ({ date, start, end }) => {
        const created = await this.taskRepository.count({
          where: { boardId: In(boardIds), isArchived: false, createdAt: Between(start, end) },
        });
        const completed = await this.taskRepository.count({
          where: { boardId: In(boardIds), isArchived: false, status: 'done', updatedAt: Between(start, end) },
        });
        return {
          date: date.toISOString().split('T')[0],
          created,
          completed,
        };
      })
    );

    // Get tasks grouped by list/column (includes custom columns)
    const tasksByColumn = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.listId', 'listId')
      .addSelect('COUNT(*)', 'count')
      .where('task.boardId IN (:...boardIds)', { boardIds })
      .andWhere('task.isArchived = :isArchived', { isArchived: false })
      .andWhere('task.listId IS NOT NULL')
      .groupBy('task.listId')
      .getRawMany();

    // Resolve list names with board and project context
    const listIds = tasksByColumn.map(r => r.listId).filter(Boolean);
    const lists = listIds.length > 0
      ? await this.listRepository.find({
          where: { id: In(listIds) },
          relations: ['board', 'board.project'],
        })
      : [];

    const byColumn = tasksByColumn.map(row => {
      const list = lists.find(l => l.id === row.listId);
      return {
        listId: row.listId,
        name: list?.name || 'Unknown',
        count: parseInt(row.count) || 0,
        position: list?.position ?? 999,
        boardId: list?.boardId || null,
        boardName: list?.board?.name || 'Unknown Board',
        projectId: list?.board?.projectId || null,
        projectName: list?.board?.project?.name || 'Unknown Project',
      };
    }).sort((a, b) => {
      // Sort by project name, then board name, then column position
      if (a.projectName !== b.projectName) return a.projectName.localeCompare(b.projectName);
      if (a.boardName !== b.boardName) return a.boardName.localeCompare(b.boardName);
      return a.position - b.position;
    });

    return {
      projects: {
        total: projects.length,
        active: projects.filter(p => !p.isArchived).length,
      },
      boards: {
        total: boards.length,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        inReview: inReviewTasks,
        todo: todoTasks,
        overdue: overdueTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        byPriority: tasksByPriority,
        byStatus: tasksByStatus,
        byColumn,
      },
      projectStats,
      teamWorkload,
      recentActivity,
    };
  }

  async getProjectAnalytics(projectId: string) {
    // Get all boards in project
    const boards = await this.boardRepository.find({
      where: { projectId, isArchived: false },
    });

    const boardIds = boards.map(b => b.id);

    // If no boards, return zeros
    if (boardIds.length === 0) {
      return {
        boards: 0,
        tasks: {
          total: 0,
          completed: 0,
          completionRate: 0,
          byPriority: [],
          byStatus: [],
        },
      };
    }

    // Get task statistics
    const totalTasks = await this.taskRepository.count({
      where: { boardId: In(boardIds), isArchived: false },
    });

    const completedTasks = await this.taskRepository.count({
      where: { boardId: In(boardIds), status: 'done', isArchived: false },
    });

    const tasksByPriority = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('task.boardId IN (:...boardIds)', { boardIds })
      .andWhere('task.isArchived = :isArchived', { isArchived: false })
      .groupBy('task.priority')
      .getRawMany();

    const tasksByStatus = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.boardId IN (:...boardIds)', { boardIds })
      .andWhere('task.isArchived = :isArchived', { isArchived: false })
      .groupBy('task.status')
      .getRawMany();

    return {
      boards: boards.length,
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        byPriority: tasksByPriority,
        byStatus: tasksByStatus,
      },
    };
  }

  async getUserAnalytics(userId: string) {
    // Get tasks assigned to user
    const assignedTasks = await this.taskRepository.find({
      where: { assigneeId: userId, isArchived: false },
    });

    const completedTasks = assignedTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = assignedTasks.filter(t => t.status === 'inProgress' || t.status === 'inReview').length;
    const todoTasks = assignedTasks.filter(t => t.status === 'todo').length;

    // Get overdue tasks
    const overdueTasks = assignedTasks.filter(
      t => t.dueDate && t.dueDate < new Date() && t.status !== 'done'
    ).length;

    return {
      tasks: {
        total: assignedTasks.length,
        completed: completedTasks,
        inProgress: inProgressTasks,
        todo: todoTasks,
        overdue: overdueTasks,
        completionRate: assignedTasks.length > 0 ? (completedTasks / assignedTasks.length) * 100 : 0,
      },
    };
  }

  async getTaskStatistics() {
    const totalTasks = await this.taskRepository.count({
      where: { isArchived: false },
    });

    const tasksByStatus = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('task.isArchived = :isArchived', { isArchived: false })
      .groupBy('task.status')
      .getRawMany();

    const tasksByPriority = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('task.isArchived = :isArchived', { isArchived: false })
      .groupBy('task.priority')
      .getRawMany();

    return {
      total: totalTasks,
      byStatus: tasksByStatus,
      byPriority: tasksByPriority,
    };
  }
}
