import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { User } from '../auth/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Board } from '../boards/entities/board.entity';
import { TasksModule } from '../tasks/tasks.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PermissionsModule } from '../common/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, User, Task, Board]),
    TasksModule,
    NotificationsModule,
    PermissionsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
