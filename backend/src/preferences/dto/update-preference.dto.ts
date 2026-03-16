import { IsOptional, IsString, IsBoolean, IsObject } from 'class-validator';

export class UpdatePreferenceDto {
  @IsString()
  @IsOptional()
  theme?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  dateFormat?: string;

  @IsString()
  @IsOptional()
  timeFormat?: string;

  @IsString()
  @IsOptional()
  weekStart?: string;

  @IsObject()
  @IsOptional()
  customSettings?: any;
}
