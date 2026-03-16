import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  get(@CurrentUser() user: any) {
    return this.preferencesService.getOrCreate(user.userId);
  }

  @Patch()
  update(@Body() updatePreferenceDto: UpdatePreferenceDto, @CurrentUser() user: any) {
    return this.preferencesService.update(user.userId, updatePreferenceDto);
  }

  @Post('reset')
  reset(@CurrentUser() user: any) {
    return this.preferencesService.reset(user.userId);
  }
}
