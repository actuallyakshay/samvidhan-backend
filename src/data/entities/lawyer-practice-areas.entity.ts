import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from "typeorm";
import { LawyerProfilesEntity } from "./lawyer-profiles.entity";
import { PracticeAreasEntity } from "./practice-areas.entity";

@Entity("lawyer_practice_areas")
@Unique(["lawyerProfile", "practiceArea"])
export class LawyerPracticeAreasEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => LawyerProfilesEntity, (lp) => lp.lawyerPracticeAreas, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "lawyer_profile_id" })
  lawyerProfile: Relation<LawyerProfilesEntity>;

  @Column({ name: "lawyer_profile_id" })
  lawyerProfileId: string;

  @ManyToOne(() => PracticeAreasEntity, (pa) => pa.lawyerPracticeAreas, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "practice_area_id" })
  practiceArea: Relation<PracticeAreasEntity>;

  @Column({ name: "practice_area_id" })
  practiceAreaId: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
