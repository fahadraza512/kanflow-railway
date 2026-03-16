import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { IsValidName } from '../../common/validators/name.validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @IsValidName()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
