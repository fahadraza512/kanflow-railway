import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  stripePaymentMethodId: string;

  @Column()
  type: string; // 'card', 'bank_account', etc.

  @Column()
  brand: string; // 'visa', 'mastercard', etc.

  @Column()
  last4: string;

  @Column({ nullable: true })
  expiryMonth: number;

  @Column({ nullable: true })
  expiryYear: number;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
