import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceMembershipService } from './services/workspace-membership.service';
import { WorkspacesController } from './workspaces.controller';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Board } from '../boards/entities/board.entity';
import { List } from '../lists/entities/list.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../auth/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      WorkspaceMember,
      Project,
      ProjectMember,
      Board,
      List,
      Task,
      User,
    ]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceMembershipService],
  exports: [WorkspacesService, WorkspaceMembershipService],
})
export class WorkspacesModule {}
