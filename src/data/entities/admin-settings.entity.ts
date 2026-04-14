import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_settings')
export class AdminSettingsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'support_email', nullable: true })
  supportEmail: string;

  @Column({ name: 'support_phone', nullable: true })
  supportPhone: string;
}
