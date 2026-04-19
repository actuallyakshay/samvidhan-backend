import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { LawyerProfilesEntity } from './lawyer-profiles.entity';

@Entity('lawyer_documents')
@Index(['lawyerProfileId'])
@Index(['isApproved'])
export class LawyerDocumentsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LawyerProfilesEntity, (lp) => lp.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lawyer_profile_id' })
  lawyerProfile: Relation<LawyerProfilesEntity>;

  @Column({ name: 'lawyer_profile_id' })
  lawyerProfileId: string;

  @Column({ name: 'asset_url', type: 'text' })
  assetUrl: string;

  @Column({ name: 'asset_name', nullable: true, length: 512 })
  assetName: string;

  @Column({
    name: 'is_approved',
    type: 'boolean',
    default: false,
  })
  isApproved: boolean;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
