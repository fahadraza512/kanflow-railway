import { IsArray, IsUUID } from 'class-validator';

export class ReorderListsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  listIds: string[];
}
