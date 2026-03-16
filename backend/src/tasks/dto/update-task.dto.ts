import { IsOptional, IsString, IsBoolean, IsNumber, IsUUID, IsArray, IsDateString, ValidateIf } from 'class-validator';
import { IsValidName } from '../../common/validators/name.validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @IsValidName()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  listId?: string;

  @IsOptional()
  @ValidateIf((o) => o.assigneeId !== null)
  @IsUUID()
  assigneeId?: string | null;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
