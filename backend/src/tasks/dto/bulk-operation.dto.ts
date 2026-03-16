import { IsArray, IsUUID, IsOptional } from 'class-validator';

export class BulkOperationDto {
  @IsArray()
  @IsUUID('4', { each: true })
  taskIds: string[];

  @IsUUID()
  @IsOptional()
  targetBoardId?: string; // For bulk move
}
