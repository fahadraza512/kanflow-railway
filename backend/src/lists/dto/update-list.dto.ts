import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateListDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}
