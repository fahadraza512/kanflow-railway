import { IsNotEmpty, IsString, IsUUID, IsOptional, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsOptional()
  relatedEntityId?: string;

  @IsString()
  @IsOptional()
  relatedEntityType?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsUUID()
  @IsOptional()
  workspaceId?: string;
}
