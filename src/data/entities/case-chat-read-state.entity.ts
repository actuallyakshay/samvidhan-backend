import { CaseMessageParticipantKind } from 'src/enums';
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

@Entity('case_chat_read_states')
@Unique(['caseId', 'readerKind'])
@Index(['caseId'])
@Index(['readerKind'])
export class CaseChatReadStateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CasesEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: Relation<CasesEntity>;

  @Column({ name: 'case_id' })
  caseId: string;

  @Column({ name: 'reader_kind', type: 'varchar', length: 16 })
  readerKind: CaseMessageParticipantKind;

  @ManyToOne(() => CaseMessagesEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'last_read_message_id' })
  lastReadMessage: Relation<CaseMessagesEntity> | null;

  @Column({ name: 'last_read_message_id', nullable: true })
  lastReadMessageId: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
