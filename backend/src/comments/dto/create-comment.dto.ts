import { IsString, IsNotEmpty, IsArray, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @IsOptional()
  mentions?: string[];
}
