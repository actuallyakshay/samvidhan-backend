import { MessageType } from 'src/enums';
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
import { UsersEntity } from './users.entity';
import { AssetsEntity } from './assets.entity';

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

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'sender_id' })
  sender: Relation<UsersEntity>;

  @Column({ name: 'sender_id' })
  senderId: string;

  @Column({
    name: 'message_type',
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  messageType: MessageType;

  @Column({ name: 'message_text', type: 'text', nullable: true })
  messageText: string;

  @ManyToOne(() => AssetsEntity)
  @JoinColumn({ name: 'asset_id' })
  asset: Relation<AssetsEntity>;

  @Column({ name: 'asset_id', nullable: true })
  assetId: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
