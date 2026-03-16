import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvitationFeatureGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const isEnabled = this.configService.get<string>('INVITE_FEATURE_ENABLED') === 'true';
    
    if (!isEnabled) {
      throw new NotFoundException('Not Found');
    }
    
    return true;
  }
}
