import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray, IsDateString } from 'class-validator';
import { IsValidName } from '../../common/validators/name.validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @IsValidName()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  boardId: string;

  @IsUUID()
  @IsOptional()
  listId?: string;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

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
}
