import { RoleCode, UserRoleStatus } from 'src/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity('user_roles')
@Unique(['user', 'roleCode'])
@Index(['userId', 'status'])
export class UserRolesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsersEntity, (u) => u.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UsersEntity>;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'role_code', type: 'enum', enum: RoleCode })
  roleCode: RoleCode;

  @Column({
    type: 'enum',
    enum: UserRoleStatus,
    default: UserRoleStatus.ACTIVE,
  })
  status: UserRoleStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
