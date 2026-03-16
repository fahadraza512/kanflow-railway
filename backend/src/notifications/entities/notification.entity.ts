import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // 'task_assigned', 'comment_mention', 'task_due', etc.

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  relatedEntityId: string; // ID of related task, comment, etc.

  @Column({ nullable: true })
  relatedEntityType: string; // 'task', 'comment', 'project', etc.

  @Column({ type: 'uuid', nullable: true })
  workspaceId: string; // Workspace context for filtering

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Additional data

  @CreateDateColumn()
  createdAt: Date;
}
