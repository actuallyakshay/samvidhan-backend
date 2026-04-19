import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { LawyerPracticeAreasEntity } from './lawyer-practice-areas.entity';
import { UsersEntity } from './users.entity';
import { LawyerDocumentsEntity } from './lawyer-documents.entity';

@Entity('lawyer_profiles')
export class LawyerProfilesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UsersEntity, (u) => u.lawyerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UsersEntity>;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'is_verified', default: false })
  @Index()
  isVerified: boolean;

  @Column({ name: 'degree', nullable: true })
  degree: string;

  @Column({ name: 'bar_council_id', nullable: true })
  barCouncilId: string;

  @Column({ name: 'career_start_date', type: 'date', nullable: true })
  careerStartDate: Date;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ name: 'address_line_1', nullable: true })
  addressLine1: string;

  @Column({ name: 'address_line_2', nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  pincode: string;

  @OneToMany(() => LawyerPracticeAreasEntity, (lpa) => lpa.lawyerProfile)
  lawyerPracticeAreas: Relation<LawyerPracticeAreasEntity[]>;

  @OneToMany(() => LawyerDocumentsEntity, (ld) => ld.lawyerProfile)
  documents: Relation<LawyerDocumentsEntity[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
