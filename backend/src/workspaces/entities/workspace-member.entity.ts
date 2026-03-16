import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { User } from '../../auth/entities/user.entity';

// Simple role tracking (not enforced - for future use)
export enum WorkspaceMemberRole {
  VIEWER = 'viewer',
  MEMBER = 'member',
  PROJECT_MANAGER = 'pm',
  ADMIN = 'admin',
  OWNER = 'owner',
}

@Entity('workspace_members')
@Index(['workspaceId', 'userId'], { unique: true })
export class WorkspaceMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  workspaceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Role field kept for future use - not currently enforced
  @Column('varchar', { length: 50, default: WorkspaceMemberRole.MEMBER })
  role: WorkspaceMemberRole;

  @Column('uuid', { nullable: true })
  invitedBy: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'invitedBy' })
  inviter: User;

  @CreateDateColumn()
  joinedAt: Date;

  @Column('timestamp', { nullable: true })
  lastActiveAt: Date;
}
