import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace]), 
    ConfigModule,
    NotificationsModule,
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
