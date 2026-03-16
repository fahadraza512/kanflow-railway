import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { EmailModule } from '../email/email.module';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Board } from '../boards/entities/board.entity';
import { Task } from '../tasks/entities/task.entity';
import { List } from '../lists/entities/list.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Preference } from '../preferences/entities/preference.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Workspace,
      WorkspaceMember,
      Project,
      ProjectMember,
      Board,
      Task,
      List,
      Notification,
      Preference,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
    EmailModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
