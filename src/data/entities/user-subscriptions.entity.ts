import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionPlansEntity } from './subscription-plans.entity';
import { UsersEntity } from './users.entity';

@Entity('user_subscriptions')
@Index(['userId'])
export class UserSubscriptionsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UsersEntity>;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => SubscriptionPlansEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: Relation<SubscriptionPlansEntity>;

  @Column({ name: 'subscription_plan_id' })
  subscriptionPlanId: string;

  @Column({ name: 'razorpay_subscription_id', type: 'varchar', length: 64, unique: true })
  razorpaySubscriptionId: string;

  /** Razorpay subscription `status` string (e.g. `active`, `created`). */
  @Column({ type: 'varchar', length: 32 })
  status: string;

  @Column({ name: 'current_period_start', type: 'timestamptz', nullable: true })
  currentPeriodStart: Date | null;

  @Column({ name: 'current_period_end', type: 'timestamptz', nullable: true })
  currentPeriodEnd: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
