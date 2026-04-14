import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { CasesEntity } from './cases.entity';
import { CaseMessagesEntity } from './case-messages.entity';
import { UsersEntity } from './users.entity';

@Entity('case_chat_read_states')
@Unique(['userId', 'caseId'])
@Index(['userId'])
@Index(['caseId'])
export class CaseChatReadStateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UsersEntity>;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => CasesEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: Relation<CasesEntity>;

  @Column({ name: 'case_id' })
  caseId: string;

  @ManyToOne(() => CaseMessagesEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'last_read_message_id' })
  lastReadMessage: Relation<CaseMessagesEntity> | null;

  @Column({ name: 'last_read_message_id', nullable: true })
  lastReadMessageId: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
