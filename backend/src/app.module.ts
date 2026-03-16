import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
// import { RedisModule } from './redis/redis.module'; // Temporarily disabled - not needed for basic functionality
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { BoardsModule } from './boards/boards.module';
import { ListsModule } from './lists/lists.module';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StripeModule } from './stripe/stripe.module';
import { BillingModule } from './billing/billing.module';
import { ActivityModule } from './activity/activity.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PreferencesModule } from './preferences/preferences.module';
import { UploadModule } from './upload/upload.module';
import { SalesModule } from './sales/sales.module';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    // RedisModule, // Temporarily disabled - not needed for basic functionality
    EmailModule,
    AuthModule,
    WorkspacesModule,
    ProjectsModule,
    BoardsModule,
    ListsModule,
    TasksModule,
    CommentsModule,
    NotificationsModule,
    StripeModule,
    BillingModule,
    ActivityModule,
    AnalyticsModule,
    PreferencesModule,
    UploadModule,
    SalesModule,
    InvitationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
