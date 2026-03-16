import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('preferences')
export class Preference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: 'light' })
  theme: string; // 'light', 'dark', 'auto'

  @Column({ default: 'en' })
  language: string; // 'en', 'es', 'fr', etc.

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  pushNotifications: boolean;

  // Email notification preferences
  @Column({ default: true })
  emailAssignments: boolean;

  @Column({ default: true })
  emailMentions: boolean;

  @Column({ default: true })
  emailComments: boolean;

  @Column({ default: true })
  emailDeadlines: boolean;

  @Column({ default: true })
  emailPaymentAlerts: boolean;

  @Column({ default: 'UTC' })
  timezone: string;

  @Column({ default: 'MM/DD/YYYY' })
  dateFormat: string;

  @Column({ default: '12h' })
  timeFormat: string; // '12h', '24h'

  @Column({ default: 'monday' })
  weekStart: string; // 'sunday', 'monday'

  @Column({ type: 'json', nullable: true })
  customSettings: any; // Additional custom settings

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
