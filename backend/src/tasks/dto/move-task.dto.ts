import { IsNotEmpty, IsUUID, IsNumber, IsOptional } from 'class-validator';

export class MoveTaskDto {
  @IsUUID()
  @IsNotEmpty()
  targetBoardId: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}
