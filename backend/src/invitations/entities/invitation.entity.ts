import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { User } from '../../auth/entities/user.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('invitations')
@Index(['token'], { unique: true })
@Index(['workspaceId', 'status'])
@Index(['invitedEmail'])
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  workspaceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column({ type: 'varchar', length: 255 })
  invitedEmail: string;

  @Column({ type: 'varchar', length: 50 })
  role: string; // 'owner', 'admin', 'pm', 'member', 'viewer'

  @Column({ type: 'varchar', length: 255, unique: true })
  token: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column('uuid', { nullable: true })
  invitedBy: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'invitedBy' })
  inviter: User;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;
}
