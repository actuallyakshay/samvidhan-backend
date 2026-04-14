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
import { CaseSessionRequestRaisedBy } from './case-session-request.entity';

@Entity('case_notes')
@Index(['caseId'])
export class CaseNotesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CasesEntity, (c) => c.caseNotes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: Relation<CasesEntity>;

  @Column({ name: 'case_id' })
  caseId: string;

  @Column({ nullable: true })
  author: CaseSessionRequestRaisedBy;

  @Column({ type: 'text' })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
