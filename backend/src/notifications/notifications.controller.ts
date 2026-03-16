import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SseAuthGuard } from './guards/sse-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('notifications')
export class NotificationsController {
  private clients: Map<string, Response> = new Map();

  constructor(
    private readonly notificationsService: NotificationsService,
    private eventEmitter: EventEmitter2,
  ) {
    // Listen for notification events
    this.eventEmitter.on('notification.created', (notification) => {
      this.sendToClient(notification.userId, notification);
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: any, @Query('limit') limit?: string) {
    return this.notificationsService.findAll(
      user.userId,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('unread')
  @UseGuards(JwtAuthGuard)
  findUnread(@CurrentUser() user: any) {
    return this.notificationsService.findUnread(user.userId);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(
    @CurrentUser() user: any,
    @Query('workspaceId') workspaceId?: string,
  ) {
    const count = await this.notificationsService.getUnreadCount(
      user.userId,
      workspaceId,
    );
    return { count };
  }

  @Get('stream')
  @UseGuards(SseAuthGuard)
  stream(@CurrentUser() user: any, @Res() res: Response) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Store client connection
    this.clients.set(user.userId, res);

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    // Send heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
    }, 30000);

    // Cleanup on close
    res.on('close', () => {
      clearInterval(heartbeat);
      this.clients.delete(user.userId);
      res.end();
    });
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user.userId);
  }

  @Post('mark-all-read')
  @UseGuards(JwtAuthGuard)
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Delete('clear-all')
  @UseGuards(JwtAuthGuard)
  clearAll(@CurrentUser() user: any, @Query('workspaceId') workspaceId?: string) {
    return this.notificationsService.clearAll(user.userId, workspaceId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.remove(id, user.userId);
  }

  private sendToClient(userId: string, notification: any) {
    const client = this.clients.get(userId);
    if (client) {
      client.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
  }
}
