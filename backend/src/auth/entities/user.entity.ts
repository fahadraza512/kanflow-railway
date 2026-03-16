import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ default: 'local' })
  provider: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  pendingInviteToken: string | null;

  @Column({ default: false })
  onboardingComplete: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ nullable: true })
  verificationTokenExpires: Date;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @Column({ nullable: true })
  activeWorkspaceId: string;

  @ManyToOne(() => Workspace, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'activeWorkspaceId' })
  activeWorkspace: Workspace;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
