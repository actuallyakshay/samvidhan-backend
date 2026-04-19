import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { In } from 'typeorm';
import { RazorpaySubscriptionStatus } from 'src/enums';
import { SubscriptionPlansRepository, UserSubscriptionsRepository } from 'src/data/repositories';
import { StartRazorpaySubscriptionDto } from './dto/start-razorpay-subscription.dto';

type RazorpaySubscriptionEntity = {
  id: string;
  status?: string;
  current_start?: number | null;
  current_end?: number | null;
};

/** Not ended — user must cancel (or let it complete) before `startSubscription` again. */
const OPEN_RAZORPAY_SUBSCRIPTION_STATUSES = [
  'created',
  'authenticated',
  'active',
  'pending',
  'halted',
] as const;

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private client: Razorpay;

  constructor(
    private readonly config: ConfigService,
    private readonly plans: SubscriptionPlansRepository,
    private readonly userSubs: UserSubscriptionsRepository
  ) {
    this.client = new Razorpay({
      key_id: this.config.getOrThrow('RAZORPAY_KEY_ID'),
      key_secret: this.config.getOrThrow('RAZORPAY_KEY_SECRET'),
    });
  }

  private unixToDate(sec: number | null | undefined): Date | null {
    if (sec == null || sec === 0) return null;
    return new Date(sec * 1000);
  }

  private async assertNoOpenSubscription(userId: string): Promise<void> {
    const existing = await this.userSubs.findOne({
      where: { userId, status: In([...OPEN_RAZORPAY_SUBSCRIPTION_STATUSES]) },
    });
    if (existing) {
      throw new BadRequestException(
        'You already have a subscription in progress or active. Cancel it before starting a new one.'
      );
    }
  }

  async startSubscription(userId: string, dto: StartRazorpaySubscriptionDto) {
    await this.assertNoOpenSubscription(userId);

    const plan = await this.plans.findOne({
      where: { id: dto.subscriptionPlanId, isActive: true },
    });
    if (!plan) {
      throw new BadRequestException('Unknown or inactive subscription plan');
    }
    if (!plan.razorpayPlanId?.trim()) {
      throw new BadRequestException('Plan is not linked to Razorpay (missing razorpay_plan_id)');
    }

    const created: RazorpaySubscriptionEntity & { short_url?: string } =
      (await this.client.subscriptions.create({
        plan_id: plan.razorpayPlanId,
        total_count: dto.totalCount,
        customer_notify: true,
        notes: { user_id: userId, subscription_plan_id: plan.id },
      })) as RazorpaySubscriptionEntity & { short_url?: string };

    await this.userSubs.save(
      this.userSubs.create({
        userId,
        subscriptionPlanId: plan.id,
        razorpaySubscriptionId: created.id,
        status: created.status || 'created',
        currentPeriodStart: this.unixToDate(created.current_start),
        currentPeriodEnd: this.unixToDate(created.current_end),
      })
    );

    return {
      subscriptionId: created.id,
      status: created.status,
      shortUrl: created.short_url,
    };
  }

  async syncSubscriptionFromPayload(entity: RazorpaySubscriptionEntity): Promise<void> {
    if (!entity.status) return;

    const { affected } = await this.userSubs.update(
      { razorpaySubscriptionId: entity.id },
      {
        status: entity.status,
        currentPeriodStart: this.unixToDate(entity.current_start),
        currentPeriodEnd: this.unixToDate(entity.current_end),
      }
    );
    if (!affected) {
      this.logger.warn(`No user_subscriptions row for Razorpay subscription ${entity.id}`);
    }
  }

  verifyWebhookSignature(rawBody: string, signature: string): void {
    const secret = this.config.getOrThrow<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!Razorpay.validateWebhookSignature(rawBody, signature, secret)) {
      throw new BadRequestException('Invalid Razorpay webhook signature');
    }
  }

  private parseSubscriptionWebhookPayload(
    body: Record<string, unknown>
  ): RazorpaySubscriptionEntity | null {
    const event = body.event;
    if (typeof event !== 'string' || !event.startsWith('subscription.')) {
      return null;
    }
    const entity = (body.payload as { subscription?: { entity?: RazorpaySubscriptionEntity } })
      ?.subscription?.entity;
    if (!entity?.id) {
      this.logger.warn(`Webhook ${String(event)} missing subscription entity`);
      return null;
    }
    return entity;
  }

  async handleWebhookEvent(body: Record<string, unknown>): Promise<void> {
    const entity = this.parseSubscriptionWebhookPayload(body);
    if (entity) await this.syncSubscriptionFromPayload(entity);
  }

  /** Paid access: Razorpay `active` only (not `created` / `authenticated`). */
  async getActiveSubscriptionForUser(userId: string) {
    const row = await this.userSubs.findOne({
      where: { userId, status: RazorpaySubscriptionStatus.ACTIVE },
      relations: { subscriptionPlan: true },
      order: { updatedAt: 'DESC' },
    });

    if (!row?.subscriptionPlan) {
      return { hasActiveSubscription: false as const, subscription: null };
    }

    const p = row.subscriptionPlan;
    return {
      hasActiveSubscription: true as const,
      subscription: {
        id: row.id,
        status: row.status,
        currentPeriodStart: row.currentPeriodStart,
        currentPeriodEnd: row.currentPeriodEnd,
        plan: {
          id: p.id,
          slug: p.slug,
          name: p.name,
          billingCycle: p.billingCycle,
        },
      },
    };
  }
}
