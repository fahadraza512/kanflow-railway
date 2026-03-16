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
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ReorderBoardsDto } from './dto/reorder-boards.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  create(@Body() createBoardDto: CreateBoardDto, @CurrentUser() user: any) {
    return this.boardsService.create(createBoardDto, user.userId);
  }

  @Get()
  findAll(
    @Query('projectId') projectId: string,
    @Query('archived') archived: string,
    @CurrentUser() user: any,
  ) {
    const isArchived = archived === 'true';
    return this.boardsService.findAll(projectId, user.userId, isArchived);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.boardsService.findOne(id, user.userId);
  }

  @Patch('reorder')
  reorder(
    @Query('projectId') projectId: string,
    @Body() reorderBoardsDto: ReorderBoardsDto,
    @CurrentUser() user: any,
  ) {
    return this.boardsService.reorder(projectId, reorderBoardsDto, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @CurrentUser() user: any,
  ) {
    return this.boardsService.update(id, updateBoardDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.boardsService.remove(id, user.userId);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string, @CurrentUser() user: any) {
    return this.boardsService.archive(id, user.userId);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string, @CurrentUser() user: any) {
    return this.boardsService.restore(id, user.userId);
  }
}
