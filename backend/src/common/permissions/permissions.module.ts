import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceMember, Workspace])],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
