import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  findAll(
    @Query('workspaceId') workspaceId?: string,
    @Query('projectId') projectId?: string,
    @Query('userId') userId?: string,
    @Query('resourceType') resourceType?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.findAll({
      workspaceId,
      projectId,
      userId,
      resourceType,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('workspace/:workspaceId')
  findByWorkspace(@Param('workspaceId') workspaceId: string, @Query('limit') limit?: string) {
    return this.activityService.findAll({
      workspaceId,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string, @Query('limit') limit?: string) {
    return this.activityService.findAll({
      projectId,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('task/:taskId')
  findByTask(@Param('taskId') taskId: string) {
    return this.activityService.findByResource('task', taskId);
  }
}
