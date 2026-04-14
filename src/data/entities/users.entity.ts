import { AccountStatus } from 'src/enums';
import { LoginProvider } from 'src/types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { LawyerProfilesEntity } from './lawyer-profiles.entity';
import { UserRolesEntity } from './user-roles.entity';

@Entity('users')
@Index(['accountStatus'])
@Index(['createdAt'])
export class UsersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ name: 'provider', type: 'enum', enum: LoginProvider, default: LoginProvider.EMAIL })
  @Index()
  provider: LoginProvider;

  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash: string;

  @Column({
    name: 'account_status',
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  accountStatus: AccountStatus;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string;

  @Column({ name: 'fcm_token', type: 'text', nullable: true })
  fcmToken?: string;

  @Column({ name: 'is_admin', type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ name: 'is_profile_completed', type: 'boolean', default: false })
  isProfileCompleted: boolean;

  @OneToMany(() => UserRolesEntity, (ur) => ur.user)
  userRoles: Relation<UserRolesEntity[]>;

  @OneToOne(() => LawyerProfilesEntity, (lp) => lp.user)
  lawyerProfile: Relation<LawyerProfilesEntity>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
