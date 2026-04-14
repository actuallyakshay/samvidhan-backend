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

export enum CaseSessionRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum CaseSessionRequestRaisedBy {
  LAWYER = 'lawyer',
  ADMIN = 'admin',
  USER = 'user',
}

export enum CaseSessionRequestApprovedBy {
  ADMIN = 'admin',
  USER = 'user',
}

export enum CallType {
  VIDEO = 'video',
  AUDIO = 'audio',
}

@Entity('case_session_requests')
@Index(['caseId'])
export class CaseSessionRequestsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CasesEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: Relation<CasesEntity>;

  @Column({ name: 'case_id' })
  caseId: string;

  @Column({ name: 'requested_date', type: 'date' })
  requestedDate: Date;

  @Column({ name: 'requested_time', type: 'time' })
  requestedTime: string;

  @Column({ name: 'call_type', type: 'enum', enum: CallType, default: CallType.VIDEO })
  callType: CallType;

  @Column({ name: 'meeting_uri', nullable: true })
  meetingUri: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CaseSessionRequestStatus,
    default: CaseSessionRequestStatus.PENDING,
  })
  status: CaseSessionRequestStatus;

  @Column({
    name: 'approved_by',
    type: 'enum',
    enum: CaseSessionRequestApprovedBy,
    nullable: true,
  })
  approvedBy?: CaseSessionRequestApprovedBy;

  @Column({
    name: 'raised_by',
    type: 'enum',
    enum: CaseSessionRequestRaisedBy,
    default: CaseSessionRequestRaisedBy.USER,
  })
  raisedBy: CaseSessionRequestRaisedBy;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
