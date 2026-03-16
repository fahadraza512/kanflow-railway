import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { BulkOperationDto } from './dto/bulk-operation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: any) {
    return this.tasksService.create(createTaskDto, user.userId);
  }

  @Get()
  findAll(
    @Query('boardId') boardId: string,
    @Query('workspaceId') workspaceId: string,
    @Query('archived') archived: string,
    @CurrentUser() user: any,
  ) {
    // If workspaceId and archived are provided, get archived tasks for workspace
    if (workspaceId && archived === 'true') {
      return this.tasksService.findArchivedByWorkspace(workspaceId, user.userId);
    }
    
    // If workspaceId is provided (without archived), get all tasks for workspace
    if (workspaceId) {
      return this.tasksService.findByWorkspace(workspaceId, user.userId);
    }
    
    // Otherwise, get tasks by board
    return this.tasksService.findAll(boardId, user.userId);
  }

  @Get('overdue')
  findOverdue(
    @Query('workspaceId') workspaceId: string,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.findOverdue(workspaceId, user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: any,
  ) {
    console.log('[TasksController.update] PATCH request received - id:', id, 'updateTaskDto:', JSON.stringify(updateTaskDto), 'userId:', user.userId);
    return this.tasksService.update(id, updateTaskDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.remove(id, user.userId);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.archive(id, user.userId);
  }

  @Patch(':id/move')
  move(
    @Param('id') id: string,
    @Body() moveTaskDto: MoveTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.move(id, moveTaskDto, user.userId);
  }

  @Post('bulk-delete')
  bulkDelete(@Body() bulkOperationDto: BulkOperationDto, @CurrentUser() user: any) {
    return this.tasksService.bulkDelete(bulkOperationDto, user.userId);
  }

  @Post('bulk-archive')
  bulkArchive(@Body() bulkOperationDto: BulkOperationDto, @CurrentUser() user: any) {
    return this.tasksService.bulkArchive(bulkOperationDto, user.userId);
  }

  @Post('bulk-move')
  bulkMove(@Body() bulkOperationDto: BulkOperationDto, @CurrentUser() user: any) {
    return this.tasksService.bulkMove(bulkOperationDto, user.userId);
  }
}
