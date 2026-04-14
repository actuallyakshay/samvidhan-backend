import { CaseStatus } from 'src/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { AssetsEntity } from './assets.entity';
import { CaseMessagesEntity } from './case-messages.entity';
import { CaseNotesEntity } from './case-notes.entity';
import { PracticeAreasEntity } from './practice-areas.entity';
import { UsersEntity } from './users.entity';
import { LawyerProfilesEntity } from './lawyer-profiles.entity';
import { CaseSessionRequestsEntity } from './case-session-request.entity';

@Entity('cases')
@Index(['status'])
@Index(['userId', 'status', 'createdAt'])
@Index(['assignedLawyerId', 'status', 'createdAt'])
@Index(['createdAt'])
export class CasesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'case_code', unique: true })
  caseCode: string;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UsersEntity>;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => LawyerProfilesEntity)
  @JoinColumn({ name: 'assigned_lawyer_id' })
  assignedLawyer: Relation<LawyerProfilesEntity>;

  @Column({ name: 'assigned_lawyer_id', nullable: true })
  assignedLawyerId: string;

  @ManyToOne(() => PracticeAreasEntity, (pa) => pa.cases)
  @JoinColumn({ name: 'practice_area_id' })
  practiceArea: Relation<PracticeAreasEntity>;

  @Column({ name: 'practice_area_id', nullable: true })
  practiceAreaId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: CaseStatus, default: CaseStatus.NEW })
  status: CaseStatus;

  @Column({ name: 'is_emergency', default: false })
  isEmergency: boolean;

  @OneToMany(() => CaseNotesEntity, (cn) => cn.case)
  caseNotes: Relation<CaseNotesEntity[]>;

  @OneToMany(() => AssetsEntity, (a) => a.case)
  assets: Relation<AssetsEntity[]>;

  @OneToMany(() => CaseMessagesEntity, (cm) => cm.case)
  caseMessages: Relation<CaseMessagesEntity[]>;

  @OneToMany(() => CaseSessionRequestsEntity, (csr) => csr.case)
  caseSessionRequests: Relation<CaseSessionRequestsEntity[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
