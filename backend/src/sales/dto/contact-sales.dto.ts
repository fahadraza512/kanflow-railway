import { IsString, IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class ContactSalesDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  workEmail: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  teamSize: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsNotEmpty()
  workspaceName: string;

  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;
}
