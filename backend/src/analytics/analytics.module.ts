import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Task } from '../tasks/entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { Board } from '../boards/entities/board.entity';
import { User } from '../auth/entities/user.entity';
import { List } from '../lists/entities/list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Project, Board, User, List])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
