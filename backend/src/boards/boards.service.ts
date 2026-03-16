import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { List } from '../lists/entities/list.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ReorderBoardsDto } from './dto/reorder-boards.dto';
import { ProjectsService } from '../projects/projects.service';
import { ListsService } from '../lists/lists.service';
import { PermissionsService } from '../common/permissions/permissions.service';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private projectsService: ProjectsService,
    private listsService: ListsService,
    private permissionsService: PermissionsService,
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: string) {
    // Check project access
    const project = await this.projectsService.findOne(createBoardDto.projectId, userId);

    // Permission: PM+ can create boards
    await this.permissionsService.requireRole(userId, project.workspaceId, 'pm');

    // Check for duplicate name in the same project (case-insensitive)
    // Check both active and archived boards
    const existingBoard = await this.boardRepository
      .createQueryBuilder('board')
      .where('board.projectId = :projectId', { projectId: createBoardDto.projectId })
      .andWhere('LOWER(board.name) = LOWER(:name)', { name: createBoardDto.name })
      .getOne();

    if (existingBoard) {
      if (existingBoard.isArchived) {
        throw new ConflictException('A board with this name exists in archive. Please delete it first or choose a different name.');
      }
      throw new ConflictException('A board with this name already exists in this project');
    }

    // Get max order
    const maxOrder = await this.boardRepository
      .createQueryBuilder('board')
      .where('board.projectId = :projectId', { projectId: createBoardDto.projectId })
      .select('MAX(board.order)', 'max')
      .getRawOne();

    const board = this.boardRepository.create({
      ...createBoardDto,
      order: (maxOrder?.max || 0) + 1,
    });

    const savedBoard = await this.boardRepository.save(board);

    // Create default lists for the board
    await this.listsService.createDefaultLists(savedBoard.id);

    return savedBoard;
  }

  async findAll(projectId: string, userId: string, isArchived = false) {
    // Check project access
    await this.projectsService.findOne(projectId, userId);

    return this.boardRepository.find({
      where: { projectId, isArchived },
      order: { order: 'ASC' },
    });
  }

  async findByWorkspace(workspaceId: string, userId: string) {
    // Get all projects in the workspace that user has access to
    const projects = await this.projectsService.findAll(workspaceId, userId);
    
    if (projects.length === 0) {
      return [];
    }

    const projectIds = projects.map(project => project.id);

    // Get all NON-ARCHIVED boards from these projects
    return this.boardRepository
      .createQueryBuilder('board')
      .where('board.projectId IN (:...projectIds)', { projectIds })
      .andWhere('board.isArchived = :isArchived', { isArchived: false })
      .orderBy('board.order', 'ASC')
      .getMany();
  }

  async findOne(id: string, userId: string) {
    const board = await this.boardRepository.findOne({
      where: { id },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check project access
    await this.projectsService.findOne(board.projectId, userId);

    // Get lists for this board
    const lists = await this.listsService.findAll(board.id);

    return {
      ...board,
      lists,
    };
  }

  async update(id: string, updateBoardDto: UpdateBoardDto, userId: string) {
    const board = await this.findOne(id, userId);

    // Permission: PM+ can update boards
    const project = await this.projectsService.findOne(board.projectId, userId);
    await this.permissionsService.requireRole(userId, project.workspaceId, 'pm');

    // Check for duplicate name if name is being updated (case-insensitive)
    // Check both active and archived boards
    if (updateBoardDto.name && updateBoardDto.name.toLowerCase() !== board.name.toLowerCase()) {
      const existingBoard = await this.boardRepository
        .createQueryBuilder('board')
        .where('board.projectId = :projectId', { projectId: board.projectId })
        .andWhere('LOWER(board.name) = LOWER(:name)', { name: updateBoardDto.name })
        .andWhere('board.id != :id', { id })
        .getOne();

      if (existingBoard) {
        if (existingBoard.isArchived) {
          throw new ConflictException('A board with this name exists in archive. Please delete it first or choose a different name.');
        }
        throw new ConflictException('A board with this name already exists in this project');
      }
    }

    Object.assign(board, updateBoardDto);
    return this.boardRepository.save(board);
  }

  async remove(id: string, userId: string) {
    const board = await this.findOne(id, userId);

    // Permission: PM+ can delete boards
    const project = await this.projectsService.findOne(board.projectId, userId);
    await this.permissionsService.requireRole(userId, project.workspaceId, 'pm');

    // Delete all related data in correct order to avoid foreign key constraints
    
    // 1. Delete all tasks in this board
    await this.taskRepository.delete({ boardId: id });
    
    // 2. Delete all lists in this board
    await this.listRepository.delete({ boardId: id });
    
    // 3. Finally delete the board
    await this.boardRepository.remove(board);
    
    return { message: 'Board deleted successfully' };
  }

  async archive(id: string, userId: string) {
    const board = await this.findOne(id, userId);

    // Permission: PM+ can archive boards
    const project = await this.projectsService.findOne(board.projectId, userId);
    await this.permissionsService.requireRole(userId, project.workspaceId, 'pm');

    board.isArchived = true;
    return this.boardRepository.save(board);
  }

  async restore(id: string, userId: string) {
    const board = await this.findOne(id, userId);

    // Permission: PM+ can restore boards
    const project = await this.projectsService.findOne(board.projectId, userId);
    await this.permissionsService.requireRole(userId, project.workspaceId, 'pm');

    board.isArchived = false;
    return this.boardRepository.save(board);
  }

  async reorder(projectId: string, reorderBoardsDto: ReorderBoardsDto, userId: string) {
    // Check project access
    const project = await this.projectsService.findOne(projectId, userId);

    // Permission: PM+ can reorder boards
    await this.permissionsService.requireRole(userId, project.workspaceId, 'pm');

    // Update order for each board
    const updatePromises = reorderBoardsDto.boardIds.map((boardId, index) =>
      this.boardRepository.update({ id: boardId }, { order: index }),
    );

    await Promise.all(updatePromises);

    return { message: 'Boards reordered successfully' };
  }
}
