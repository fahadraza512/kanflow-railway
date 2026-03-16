import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { IsValidName } from '../../common/validators/name.validator';

export class UpdateWorkspaceDto {
  @IsString()
  @IsOptional()
  @IsValidName()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
