import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ReorderListsDto } from './dto/reorder-lists.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('lists')
@UseGuards(JwtAuthGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  create(@Body() createListDto: CreateListDto) {
    return this.listsService.create(createListDto);
  }

  @Get('board/:boardId')
  findAll(@Param('boardId') boardId: string) {
    return this.listsService.findAll(boardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
    return this.listsService.update(id, updateListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listsService.remove(id);
  }

  @Post('board/:boardId/reorder')
  reorder(
    @Param('boardId') boardId: string,
    @Body() reorderListsDto: ReorderListsDto,
  ) {
    return this.listsService.reorder(boardId, reorderListsDto);
  }
}
