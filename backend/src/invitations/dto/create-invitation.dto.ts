import { IsEmail, IsString, IsUUID, IsIn } from 'class-validator';
import { WorkspaceMemberRole } from '../../workspaces/entities/workspace-member.entity';

export class CreateInvitationDto {
  @IsUUID()
  workspaceId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsIn(Object.values(WorkspaceMemberRole))
  role: string;
}
