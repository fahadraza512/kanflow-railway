import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { IsValidName } from '../../common/validators/name.validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  @IsValidName()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsOptional()
  color?: string;
}
