import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { InvitationFeatureGuard } from './guards/invitation-feature.guard';

@Controller('invitations')
@UseGuards(InvitationFeatureGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @Request() req,
  ) {
    const invitation = await this.invitationsService.createInvitation(
      createInvitationDto.workspaceId,
      createInvitationDto.email,
      createInvitationDto.role,
      req.user.userId,
    );

    return {
      success: true,
      data: {
        id: invitation.id,
        email: invitation.invitedEmail,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
      },
    };
  }

  @Get('validate')
  async validateToken(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    const invitation = await this.invitationsService.validateToken(token);

    // At this point, validateToken has already checked workspace existence
    // and either loaded it or thrown an error
    if (!invitation.workspace) {
      throw new NotFoundException(
        'The workspace associated with this invitation no longer exists. It may have been deleted.',
      );
    }

    return {
      success: true,
      data: {
        workspaceName: invitation.workspace.name,
        inviterName: invitation.inviter
          ? `${invitation.inviter.firstName} ${invitation.inviter.lastName}`
          : 'A team member',
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    };
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
    @Request() req,
  ) {
    const result = await this.invitationsService.acceptInvitation(
      acceptInvitationDto.token,
      req.user.userId,
    );

    return {
      success: true,
      message: 'Invitation accepted successfully',
      workspaceId: result.workspaceId,
      workspaceName: result.workspaceName,
      role: result.role,
    };
  }

  @Post('decline')
  async declineInvitation(@Body() body: { token: string }) {
    if (!body?.token) {
      throw new BadRequestException('Token is required');
    }
    await this.invitationsService.declineInvitation(body.token);
    return { success: true, message: 'Invitation declined' };
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelInvitation(@Param('id') id: string, @Request() req) {
    await this.invitationsService.cancelInvitation(id, req.user.userId);

    return {
      success: true,
      message: 'Invitation cancelled successfully',
    };
  }

  @Post(':id/resend')
  @UseGuards(JwtAuthGuard)
  async resendInvitation(@Param('id') id: string, @Request() req) {
    const invitation = await this.invitationsService.resendInvitation(
      id,
      req.user.userId,
    );

    return {
      success: true,
      message: 'Invitation resent successfully',
      data: {
        expiresAt: invitation.expiresAt,
      },
    };
  }

  @Get('workspace/:workspaceId')
  @UseGuards(JwtAuthGuard)
  async getWorkspaceInvitations(
    @Param('workspaceId') workspaceId: string,
    @Query('status') status: string,
    @Request() req,
  ) {
    const invitations = await this.invitationsService.getWorkspaceInvitations(
      workspaceId,
      req.user.userId,
      status as any,
    );

    return {
      success: true,
      data: invitations.map((inv) => ({
        id: inv.id,
        email: inv.invitedEmail,
        role: inv.role,
        status: inv.status,
        inviterName: inv.inviter
          ? `${inv.inviter.firstName} ${inv.inviter.lastName}`
          : 'Unknown',
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
        acceptedAt: inv.acceptedAt,
        memberRemoved: (inv as any).memberRemoved ?? false,
      })),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteInvitation(@Param('id') id: string, @Request() req) {
    await this.invitationsService.deleteInvitation(id, req.user.userId);
    return { success: true, message: 'Invitation deleted successfully' };
  }
}
