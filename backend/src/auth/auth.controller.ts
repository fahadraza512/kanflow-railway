import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  Res,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto, ForgotPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Query('inviteToken') inviteToken?: string) {
    return this.authService.register(registerDto, inviteToken);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);
    const frontendUrl = this.configService.get('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}&refreshToken=${result.refreshToken}`);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
  @Post('resend-verification')
  async resendVerification(
    @Body('email') email: string,
    @Body('firstName') firstName?: string,
    @Body('lastName') lastName?: string,
    @Body('password') password?: string,
  ) {
    return this.authService.resendVerification(email, firstName, lastName, password);
  }

  @Post('cancel-unverified')
  async cancelUnverifiedAccount(@Body('email') email: string) {
    return this.authService.cancelUnverifiedAccount(email);
  }

  @Post('cleanup-unverified')
  async cleanupUnverifiedAccounts() {
    return this.authService.cleanupUnverifiedAccounts();
  }

  @Get('email-from-token')
  async getEmailFromToken(@Query('token') token: string) {
    return this.authService.getEmailFromToken(token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    return this.authService.getProfile(user.userId);
  }

  @Post('complete-onboarding')
  @UseGuards(JwtAuthGuard)
  async completeOnboarding(@CurrentUser() user: any) {
    return this.authService.completeOnboarding(user.userId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
      changePasswordDto.confirmPassword,
    );
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@CurrentUser() user: any) {
    return this.authService.deleteAccount(user.userId);
  }

  @Post('cleanup-stale-tokens')
  async cleanupStaleTokens() {
    return this.authService.cleanupStalePendingTokens();
  }

  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: any) {
    await this.authService.logout(user.userId);
    return { message: 'Logged out successfully' };
  }
}
