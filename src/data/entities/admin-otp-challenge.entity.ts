import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity('admin_otp_challenges')
@Index(['userId'])
@Index(['expiresAt'])
export class AdminOtpChallengeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UsersEntity>;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'otp_hash' })
  otpHash: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
