import { IsArray, IsUUID } from 'class-validator';

export class ReorderBoardsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  boardIds: string[];
}
