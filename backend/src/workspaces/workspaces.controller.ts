import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceMembershipService } from './services/workspace-membership.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly membershipService: WorkspaceMembershipService,
  ) {}

  @Post()
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @CurrentUser() user: any) {
    return this.workspacesService.create(createWorkspaceDto, user.userId);
  }

  @Get('my-workspaces')
  async getMyWorkspaces(@CurrentUser() user: any) {
    const workspaces = await this.workspacesService.getUserWorkspaces(user.userId);
    return {
      success: true,
      data: workspaces,
    };
  }

  /**
   * GET /workspaces/dashboard
   * Gets user's dashboard with all workspaces
   */
  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    return this.workspacesService.findAll(user.userId);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.workspacesService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workspacesService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.update(id, updateWorkspaceDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workspacesService.remove(id, user.userId);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workspacesService.archive(id, user.userId);
  }

  // Admin endpoint to upgrade workspace subscription
  // TODO: Add admin guard when role system is implemented
  @Patch(':id/subscription')
  upgradeSubscription(
    @Param('id') id: string,
    @Body() dto: { subscription: 'free' | 'pro' },
  ) {
    return this.workspacesService.upgradeSubscription(id, dto.subscription);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workspacesService.getMembers(id, user.userId);
  }

  @Get(':id/members/me')
  getCurrentUserMember(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workspacesService.getCurrentUserMember(id, user.userId);
  }

  @Patch(':id/members/:userId')
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
    @Body() dto: { role: string },
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.updateMemberRole(id, memberUserId, dto.role, user.userId);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
    @CurrentUser() user: any,
  ) {
    return this.workspacesService.removeMember(id, memberUserId, user.userId);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() dto: { email?: string; userId?: string; role: string },
    @CurrentUser() user: any,
  ) {
    // Accept either email or userId
    const emailOrUserId = dto.email || dto.userId;
    if (!emailOrUserId) {
      throw new BadRequestException('Either email or userId must be provided');
    }
    return this.workspacesService.addMember(id, emailOrUserId, dto.role as any, user.userId);
  }

  @Post(':id/heartbeat')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateActivity(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    try {
      await this.workspacesService.updateUserActivity(id, user.userId);
    } catch (error) {
      // Handle invalid workspace ID - return 404
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Handle database connection failures - return 503
      if (error.message === 'Database connection failed') {
        throw new HttpException(
          'Service temporarily unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // For other errors, log and return 500
      console.error('Heartbeat error:', error);
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
