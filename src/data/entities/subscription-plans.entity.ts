import { BillingCycle } from 'src/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('subscription_plans')
@Unique(['slug'])
export class SubscriptionPlansEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  features: string;

  @Column({ name: 'price_inr', type: 'decimal', precision: 10, scale: 2 })
  priceInr: number;

  @Column({ name: 'billing_cycle', type: 'enum', enum: BillingCycle })
  billingCycle: BillingCycle;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'razorpay_plan_id', type: 'varchar', length: 64, nullable: true })
  razorpayPlanId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
