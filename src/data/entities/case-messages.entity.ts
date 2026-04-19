import { CaseMessageParticipantKind, MessageType } from 'src/enums';
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
import { CasesEntity } from './cases.entity';

@Entity('case_messages')
@Index(['caseId', 'createdAt'])
export class CaseMessagesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CasesEntity, (c) => c.caseMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: Relation<CasesEntity>;

  @Column({ name: 'case_id' })
  caseId: string;

  @Column({ name: 'sender_kind', type: 'varchar', length: 16 })
  senderKind: CaseMessageParticipantKind;

  @Column({
    name: 'message_type',
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  messageType: MessageType;

  @Column({ name: 'message_text', type: 'text', nullable: true })
  messageText: string;

  /** GCP (or other) URL for chat image/PDF — no join to assets table. */
  @Column({ name: 'asset_url', type: 'text', nullable: true })
  assetUrl: string | null;

  @Column({ name: 'asset_name', type: 'varchar', length: 512, nullable: true })
  assetName: string | null;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
