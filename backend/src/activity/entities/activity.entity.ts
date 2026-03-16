import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; // 'created', 'updated', 'deleted', 'moved', 'archived', etc.

  @Column()
  resourceType: string; // 'task', 'project', 'board', 'comment', etc.

  @Column({ type: 'uuid' })
  resourceId: string;

  @Column({ nullable: true })
  resourceName: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  workspaceId: string;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Additional context (old values, new values, etc.)

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
