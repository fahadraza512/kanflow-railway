import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { Board } from '../boards/entities/board.entity';
import { List } from '../lists/entities/list.entity';
import { Task } from '../tasks/entities/task.entity';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMember, Board, List, Task, WorkspaceMember]),
    WorkspacesModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
