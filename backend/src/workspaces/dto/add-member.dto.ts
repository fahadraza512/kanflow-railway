import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { WorkspaceMemberRole } from '../entities/workspace-member.entity';

export class AddWorkspaceMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(WorkspaceMemberRole)
  @IsNotEmpty()
  role: WorkspaceMemberRole;
}
