import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { LoggerService } from '../common/logger/logger.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private logger: LoggerService;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    private notificationsService: NotificationsService,
  ) {
    this.logger = new LoggerService('StripeService');
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    
    // Only initialize Stripe if a valid key is provided
    // Valid keys: start with sk_test_ or sk_live_ and are longer than 30 characters
    const isValidKey = stripeKey && 
                       (stripeKey.startsWith('sk_test_') || stripeKey.startsWith('sk_live_')) &&
                       stripeKey.length > 30 &&
                       !stripeKey.includes('your_stripe_secret_key'); // Exclude placeholder
    
    if (isValidKey) {
      try {
        this.stripe = new Stripe(stripeKey, {
          apiVersion: '2024-11-20.acacia' as any,
        });
        this.logger.logSuccess('Stripe initialized successfully');
      } catch (error) {
        this.logger.logError('Failed to initialize Stripe', error);
        this.stripe = null as any;
      }
    } else {
      // Stripe not configured - will throw errors if payment methods are called
      this.logger.logWarning('Stripe not configured. Payment features will not work.');
      this.logger.warn('   To enable payments, add a valid STRIPE_SECRET_KEY to your .env file');
      this.stripe = null as any;
    }
  }

  async createCheckoutSession(
    workspaceId: string,
    plan: 'pro',
    billingCycle: 'monthly' | 'annual',
    userId: string,
    returnUrl?: string, // Optional return URL for onboarding flow
  ) {
    // Check if Stripe is configured
    if (!this.stripe) {
      // DUMMY MODE: Simulate Stripe checkout without real Stripe
      console.log('⚠️  DUMMY MODE: Simulating Stripe checkout (no real payment)');
      return this.createDummyCheckoutSession(workspaceId, plan, billingCycle, returnUrl);
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Get price ID based on plan and billing cycle
    const priceId = this.getPriceId(plan, billingCycle);

    // Create or get customer
    let customerId = workspace.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        metadata: {
          workspaceId: workspace.id,
          userId,
        },
      });
      customerId = customer.id;
      workspace.stripeCustomerId = customerId;
      await this.workspaceRepository.save(workspace);
    }

    // Determine success and cancel URLs based on context
    const baseUrl = this.configService.get('FRONTEND_URL');
    const successUrl = returnUrl 
      ? `${baseUrl}${returnUrl}?payment=success`
      : `${baseUrl}/dashboard?payment=success`;
    const cancelUrl = returnUrl
      ? `${baseUrl}${returnUrl}?payment=cancelled`
      : `${baseUrl}/dashboard?payment=cancelled`;

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        workspaceId: workspace.id,
        plan,
        billingCycle,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * DUMMY MODE: Simulate Stripe checkout without real Stripe credentials
   * This creates a mock checkout page that simulates the payment flow
   */
  private async createDummyCheckoutSession(
    workspaceId: string,
    plan: 'pro',
    billingCycle: 'monthly' | 'annual',
    returnUrl?: string,
  ) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Generate a dummy session ID
    const dummySessionId = `dummy_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session data temporarily (in production, this would be in Stripe)
    const sessionData = {
      workspaceId: workspace.id,
      plan,
      billingCycle,
      returnUrl,
      createdAt: new Date().toISOString(),
    };
    
    // In a real app, you'd store this in Redis or a database
    // For now, we'll encode it in the URL
    const encodedData = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    
    // Create a dummy checkout URL that points to our frontend
    const baseUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const dummyCheckoutUrl = `${baseUrl}/dummy-checkout?session=${dummySessionId}&data=${encodedData}`;
    
    console.log('🎭 DUMMY CHECKOUT SESSION CREATED:');
    console.log('   Workspace:', workspace.name);
    console.log('   Plan:', plan);
    console.log('   Billing:', billingCycle);
    console.log('   URL:', dummyCheckoutUrl);
    
    return {
      sessionId: dummySessionId,
      url: dummyCheckoutUrl,
      isDummy: true, // Flag to indicate this is a dummy session
    };
  }

  /**
   * Create checkout session for pending workspace (workspace will be created after payment)
   * This is used when user selects Pro plan during onboarding
   */
  async createCheckoutSessionPending(
    workspaceName: string,
    workspaceLogo: string | undefined,
    plan: 'pro',
    billingCycle: 'monthly' | 'annual',
    userId: string,
    returnUrl?: string,
  ) {
    // Check if Stripe is configured
    if (!this.stripe) {
      // DUMMY MODE: Create dummy checkout for pending workspace
      console.log('⚠️  DUMMY MODE: Creating checkout for pending workspace (no real payment)');
      return this.createDummyCheckoutSessionPending(workspaceName, workspaceLogo, plan, billingCycle, userId, returnUrl);
    }

    // Real Stripe implementation would go here
    // For now, we'll use dummy mode
    return this.createDummyCheckoutSessionPending(workspaceName, workspaceLogo, plan, billingCycle, userId, returnUrl);
  }

  /**
   * DUMMY MODE: Create checkout session for pending workspace
   */
  private async createDummyCheckoutSessionPending(
    workspaceName: string,
    workspaceLogo: string | undefined,
    plan: 'pro',
    billingCycle: 'monthly' | 'annual',
    userId: string,
    returnUrl?: string,
  ) {
    // Generate a dummy session ID
    const dummySessionId = `dummy_session_pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session data with workspace details
    const sessionData = {
      workspaceName,
      workspaceLogo,
      plan,
      billingCycle,
      userId,
      returnUrl,
      isPending: true, // Flag to indicate workspace needs to be created
      createdAt: new Date().toISOString(),
    };
    
    // Encode session data in URL
    const encodedData = Buffer.from(JSON.stringify(sessionData)).toString('base64');
    
    // Create a dummy checkout URL
    const baseUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const dummyCheckoutUrl = `${baseUrl}/dummy-checkout?session=${dummySessionId}&data=${encodedData}`;
    
    console.log('🎭 DUMMY CHECKOUT SESSION CREATED (PENDING WORKSPACE):');
    console.log('   Workspace Name:', workspaceName);
    console.log('   Plan:', plan);
    console.log('   Billing:', billingCycle);
    console.log('   User ID:', userId);
    console.log('   URL:', dummyCheckoutUrl);
    
    return {
      sessionId: dummySessionId,
      url: dummyCheckoutUrl,
      isDummy: true,
      isPending: true,
    };
  }

  private getPriceId(plan: 'pro', billingCycle: 'monthly' | 'annual'): string {
    const envKey = `STRIPE_${plan.toUpperCase()}_PRICE_ID_${billingCycle.toUpperCase()}`;
    const priceId = this.configService.get(envKey);
    
    if (!priceId) {
      throw new Error(`Price ID not configured for ${plan} ${billingCycle}`);
    }
    
    return priceId;
  }

  async createPortalSession(workspaceId: string) {
    // Check if Stripe is configured
    if (!this.stripe) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables.');
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace || !workspace.stripeCustomerId) {
      throw new Error('No subscription found');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: workspace.stripeCustomerId,
      return_url: `${this.configService.get('FRONTEND_URL')}/billing`,
    });

    return {
      url: session.url,
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    // Check if Stripe is configured
    if (!this.stripe) {
      console.warn('Webhook received but Stripe is not configured');
      return { received: false, error: 'Stripe not configured' };
    }

    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const workspaceId = session.metadata?.workspaceId;
    const plan = session.metadata?.plan as 'pro' | undefined;
    
    if (!workspaceId) return;

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (workspace && session.subscription) {
      workspace.stripeSubscriptionId = session.subscription as string;
      workspace.subscription = plan || 'pro'; // Use plan from metadata, default to 'pro'
      await this.workspaceRepository.save(workspace);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const workspace = await this.workspaceRepository.findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (workspace) {
      const wasActive = workspace.subscription === 'pro';
      workspace.subscription = subscription.status === 'active' ? 'pro' : 'free';
      await this.workspaceRepository.save(workspace);

      // Notify owner if subscription was renewed
      if (!wasActive && subscription.status === 'active') {
        await this.notificationsService.notifySubscriptionRenewed(
          workspace.id,
          workspace.ownerId,
          workspace.name,
        );
      }
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const workspace = await this.workspaceRepository.findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (workspace) {
      workspace.subscription = 'free';
      workspace.stripeSubscriptionId = null as any;
      await this.workspaceRepository.save(workspace);

      // Notify owner that subscription expired
      await this.notificationsService.notifySubscriptionExpired(
        workspace.id,
        workspace.ownerId,
        workspace.name,
      );
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log('Invoice payment succeeded:', invoice.id);
    
    // Find workspace by Stripe customer ID
    const workspace = await this.workspaceRepository.findOne({
      where: { stripeCustomerId: invoice.customer as string },
    });

    if (workspace) {
      // Notify workspace owner of successful payment
      await this.notificationsService.notifyPaymentSucceeded(
        workspace.id,
        workspace.ownerId,
        workspace.name,
        invoice.amount_paid ? `$${(invoice.amount_paid / 100).toFixed(2)}` : undefined,
      );
    }
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    console.log('Invoice payment failed:', invoice.id);
    
    // Find workspace by Stripe customer ID
    const workspace = await this.workspaceRepository.findOne({
      where: { stripeCustomerId: invoice.customer as string },
    });

    if (workspace) {
      // Notify workspace owner of failed payment
      await this.notificationsService.notifyPaymentFailed(
        workspace.id,
        workspace.ownerId,
        workspace.name,
        invoice.amount_due ? `$${(invoice.amount_due / 100).toFixed(2)}` : undefined,
      );
    }
  }

  async getSubscriptionStatus(workspaceId: string) {
    // Check if Stripe is configured
    if (!this.stripe) {
      return {
        status: 'free',
        subscription: null,
        error: 'Stripe not configured',
      };
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace || !workspace.stripeSubscriptionId) {
      return {
        status: 'free',
        subscription: null,
      };
    }

    const subscription = await this.stripe.subscriptions.retrieve(
      workspace.stripeSubscriptionId,
    );

    return {
      status: workspace.subscription,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: (subscription as any).current_period_end,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      },
    };
  }

  /**
   * DUMMY MODE: Simulate successful payment and upgrade workspace
   * This is called by the dummy checkout page to complete the "payment"
   */
  async handleDummyPaymentSuccess(
    workspaceId: string,
    plan: 'pro',
    billingCycle: 'monthly' | 'annual',
  ) {
    console.log('🎭 DUMMY PAYMENT SUCCESS:');
    console.log('   Workspace ID:', workspaceId);
    console.log('   Plan:', plan);
    console.log('   Billing Cycle:', billingCycle);
    
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Generate a dummy subscription ID
    const dummySubscriptionId = `dummy_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update workspace to Pro plan
    workspace.subscription = plan;
    workspace.stripeSubscriptionId = dummySubscriptionId;
    workspace.stripeCustomerId = workspace.stripeCustomerId || `dummy_cus_${Date.now()}`;
    
    await this.workspaceRepository.save(workspace);
    
    console.log('✅ Workspace upgraded to Pro plan (dummy mode)');
    
    return {
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        subscription: workspace.subscription,
        subscriptionId: workspace.stripeSubscriptionId,
      },
      message: 'Payment successful (dummy mode)',
    };
  }

  /**
   * DUMMY MODE: Create workspace and set it to Pro after successful payment
   * This is called when user selects Pro plan during onboarding
   */
  async handleDummyPaymentSuccessWithWorkspaceCreation(
    workspaceName: string,
    workspaceLogo: string | undefined,
    plan: 'pro',
    billingCycle: 'monthly' | 'annual',
    userId: string,
  ) {
    console.log('🎭 DUMMY PAYMENT SUCCESS (CREATE WORKSPACE):');
    console.log('   Workspace Name:', workspaceName);
    console.log('   Plan:', plan);
    console.log('   Billing Cycle:', billingCycle);
    console.log('   User ID:', userId);
    
    // Generate dummy IDs
    const dummySubscriptionId = `dummy_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const dummyCustomerId = `dummy_cus_${Date.now()}`;
    
    // Create workspace directly as Pro
    const workspace = this.workspaceRepository.create({
      name: workspaceName,
      logo: workspaceLogo,
      description: `${plan} plan workspace`,
      subscription: plan, // Create as Pro directly
      stripeSubscriptionId: dummySubscriptionId,
      stripeCustomerId: dummyCustomerId,
      ownerId: userId,
    });
    
    await this.workspaceRepository.save(workspace);
    
    console.log('✅ Pro workspace created successfully (dummy mode)');
    console.log('   Workspace ID:', workspace.id);
    
    return {
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        subscription: workspace.subscription,
        subscriptionId: workspace.stripeSubscriptionId,
        logo: workspace.logo,
        ownerId: workspace.ownerId,
        createdAt: workspace.createdAt,
      },
      message: 'Payment successful and workspace created (dummy mode)',
    };
  }
}
