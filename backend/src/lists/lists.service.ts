import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './entities/list.entity';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ReorderListsDto } from './dto/reorder-lists.dto';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private listRepository: Repository<List>,
  ) {}

  async create(createListDto: CreateListDto): Promise<List> {
    // Get max position if not provided
    if (createListDto.position === undefined) {
      const maxPosition = await this.listRepository
        .createQueryBuilder('list')
        .where('list.boardId = :boardId', { boardId: createListDto.boardId })
        .select('MAX(list.position)', 'max')
        .getRawOne();

      createListDto.position = (maxPosition?.max || 0) + 1;
    }

    const list = this.listRepository.create(createListDto);
    return this.listRepository.save(list);
  }

  async createDefaultLists(boardId: string): Promise<List[]> {
    const defaultLists = [
      { name: 'Backlog', position: 1 },
      { name: 'In Progress', position: 2 },
      { name: 'In Review', position: 3 },
      { name: 'Done', position: 4 },
    ];

    const lists = defaultLists.map((listData) =>
      this.listRepository.create({
        ...listData,
        boardId,
      }),
    );

    return this.listRepository.save(lists);
  }

  async findAll(boardId: string): Promise<List[]> {
    return this.listRepository.find({
      where: { boardId },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string): Promise<List> {
    const list = await this.listRepository.findOne({
      where: { id },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    return list;
  }

  async update(id: string, updateListDto: UpdateListDto): Promise<List> {
    const list = await this.findOne(id);

    Object.assign(list, updateListDto);
    return this.listRepository.save(list);
  }

  async remove(id: string): Promise<void> {
    const list = await this.findOne(id);
    // Delete all tasks in this list first to avoid FK constraint issues
    await this.listRepository.manager.delete('tasks', { listId: id });
    await this.listRepository.remove(list);
  }

  async reorder(boardId: string, reorderListsDto: ReorderListsDto): Promise<void> {
    const updatePromises = reorderListsDto.listIds.map((listId, index) =>
      this.listRepository.update({ id: listId }, { position: index + 1 }),
    );

    await Promise.all(updatePromises);
  }
}
