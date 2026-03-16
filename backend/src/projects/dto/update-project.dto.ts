import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { IsValidName } from '../../common/validators/name.validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  @IsValidName()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
