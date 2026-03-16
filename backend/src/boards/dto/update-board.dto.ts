import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { IsValidName } from '../../common/validators/name.validator';

export class UpdateBoardDto {
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

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
