import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.create(createProjectDto, user.userId);
  }

  @Get()
  findAll(
    @Query('workspaceId') workspaceId: string,
    @Query('isArchived') isArchived: string,
    @CurrentUser() user: any,
  ) {
    const archived = isArchived === 'true';
    return this.projectsService.findAll(workspaceId, user.userId, archived);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.update(id, updateProjectDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.remove(id, user.userId);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.archive(id, user.userId);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.getMembers(id, user.userId);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.addMember(id, addMemberDto, user.userId);
  }

  @Delete(':id/members/:userId')
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.removeMember(id, userId, user.userId);
  }
}
