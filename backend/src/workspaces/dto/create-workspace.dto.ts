import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';
import { IsValidName } from '../../common/validators/name.validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @IsValidName()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  @IsIn(['free', 'pro'])
  subscription?: string;
}
