import { AssetType } from 'src/enums';
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
import { AssetAuthor } from 'src/types';

@Entity('assets')
@Index(['caseId'])
export class AssetsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CasesEntity, (c) => c.assets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'case_id' })
  case: Relation<CasesEntity>;

  @Column({ name: 'case_id', nullable: true })
  caseId: string;

  @Column({ default: AssetAuthor.USER })
  author: AssetAuthor;

  @Column({ name: 'asset_url', type: 'text' })
  assetUrl: string;

  @Column({ name: 'asset_type', default: AssetType.OTHER })
  assetType: AssetType;

  @Column({ name: 'asset_name', nullable: true })
  assetName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
