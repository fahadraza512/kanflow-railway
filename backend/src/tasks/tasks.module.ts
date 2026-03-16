import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { User } from '../auth/entities/user.entity';
import { Board } from '../boards/entities/board.entity';
import { BoardsModule } from '../boards/boards.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User, Board]), 
    BoardsModule,
    forwardRef(() => NotificationsModule),
    ActivityModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
