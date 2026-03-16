import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  stripeInvoiceId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column()
  status: string; // 'paid', 'open', 'void', 'uncollectible'

  @Column({ type: 'timestamp' })
  invoiceDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  invoiceUrl: string;

  @Column({ nullable: true })
  invoicePdf: string;

  @CreateDateColumn()
  createdAt: Date;
}
