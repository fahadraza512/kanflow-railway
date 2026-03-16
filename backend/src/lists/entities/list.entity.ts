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

@Entity('lists')
export class List {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'uuid' })
  boardId: string;

  @ManyToOne(() => Board)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({ default: 0 })
  position: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
