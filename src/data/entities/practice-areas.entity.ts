import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { CasesEntity } from './cases.entity';
import { LawyerPracticeAreasEntity } from './lawyer-practice-areas.entity';

@Entity('practice_areas')
export class PracticeAreasEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => LawyerPracticeAreasEntity, (lpa) => lpa.practiceArea)
  lawyerPracticeAreas: Relation<LawyerPracticeAreasEntity[]>;

  @OneToMany(() => CasesEntity, (c) => c.practiceArea)
  cases: Relation<CasesEntity[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
