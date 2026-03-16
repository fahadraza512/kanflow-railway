import { IsNotEmpty, IsUUID, IsString, IsOptional } from 'class-validator';

export class AddMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  role?: string; // 'admin', 'member', 'viewer'
}
