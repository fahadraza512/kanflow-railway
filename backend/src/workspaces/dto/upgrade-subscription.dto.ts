import { IsEnum, IsNotEmpty } from 'class-validator';

export enum SubscriptionType {
  FREE = 'free',
  PRO = 'pro',
}

export class UpgradeSubscriptionDto {
  @IsEnum(SubscriptionType)
  @IsNotEmpty()
  subscription: SubscriptionType;
}
