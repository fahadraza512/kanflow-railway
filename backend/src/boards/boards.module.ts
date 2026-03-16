import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board } from './entities/board.entity';
import { List } from '../lists/entities/list.entity';
import { Task } from '../tasks/entities/task.entity';
import { ProjectsModule } from '../projects/projects.module';
import { ListsModule } from '../lists/lists.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, List, Task]),
    ProjectsModule,
    ListsModule
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
