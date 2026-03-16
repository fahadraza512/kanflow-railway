import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { List } from '../../lists/entities/list.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  boardId: string;

  @ManyToOne(() => Board)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({ type: 'uuid', nullable: true })
  listId: string | null;

  @ManyToOne(() => List, { nullable: true })
  @JoinColumn({ name: 'listId' })
  list: List;

  @Column({ type: 'uuid', nullable: true })
  assigneeId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee: User | null;

  @Column({ default: 'todo' })
  status: string; // 'todo', 'inProgress', 'inReview', 'done'

  @Column({ default: 'medium' })
  priority: string; // 'low', 'medium', 'high', 'urgent'

  @Column({ type: 'simple-array', nullable: true })
  labels: string[];

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
