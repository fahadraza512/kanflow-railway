import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @IsOptional()
  mentions?: string[];
}
