import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Request } from 'express';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Body('workspaceId') workspaceId: string,
    @Body('plan') plan: 'pro',
    @Body('billingCycle') billingCycle: 'monthly' | 'annual',
    @Body('returnUrl') returnUrl: string | undefined,
    @CurrentUser() user: any,
  ) {
    const result = await this.stripeService.createCheckoutSession(workspaceId, plan, billingCycle, user.userId, returnUrl);
    
    // Return in the format expected by frontend
    return {
      success: true,
      data: result,
    };
  }

  @Post('create-checkout-session-pending')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSessionPending(
    @Body('workspaceName') workspaceName: string,
    @Body('workspaceLogo') workspaceLogo: string | undefined,
    @Body('plan') plan: 'pro',
    @Body('billingCycle') billingCycle: 'monthly' | 'annual',
    @Body('returnUrl') returnUrl: string | undefined,
    @CurrentUser() user: any,
  ) {
    const result = await this.stripeService.createCheckoutSessionPending(
      workspaceName,
      workspaceLogo,
      plan,
      billingCycle,
      user.userId,
      returnUrl
    );
    
    // Return in the format expected by frontend
    return {
      success: true,
      data: result,
    };
  }

  @Post('create-portal-session')
  @UseGuards(JwtAuthGuard)
  async createPortalSession(@Body('workspaceId') workspaceId: string) {
    const result = await this.stripeService.createPortalSession(workspaceId);
    
    // Return in the format expected by frontend
    return {
      success: true,
      data: result,
    };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest,
  ) {
    return this.stripeService.handleWebhook(signature, req.rawBody || Buffer.from(''));
  }

  @Post('dummy-webhook')
  async handleDummyWebhook(
    @Body('workspaceId') workspaceId: string | undefined,
    @Body('workspaceName') workspaceName: string | undefined,
    @Body('workspaceLogo') workspaceLogo: string | undefined,
    @Body('plan') plan: 'pro',
    @Body('billingCycle') billingCycle: 'monthly' | 'annual',
    @Body('userId') userId: string | undefined,
    @Req() req: any,
  ) {
    // DUMMY MODE: Simulate successful payment webhook
    console.log('🎭 DUMMY WEBHOOK: Simulating successful payment');
    
    // Get user ID from request (either from body or from auth)
    const effectiveUserId = userId || req.user?.userId;
    
    if (workspaceId) {
      // Workspace exists - just upgrade it
      return this.stripeService.handleDummyPaymentSuccess(workspaceId, plan, billingCycle);
    } else if (workspaceName && effectiveUserId) {
      // Workspace doesn't exist - create it as Pro
      return this.stripeService.handleDummyPaymentSuccessWithWorkspaceCreation(
        workspaceName,
        workspaceLogo,
        plan,
        billingCycle,
        effectiveUserId,
      );
    } else {
      throw new Error('Either workspaceId or (workspaceName + userId) must be provided');
    }
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionStatus(@Body('workspaceId') workspaceId: string) {
    return this.stripeService.getSubscriptionStatus(workspaceId);
  }
}
