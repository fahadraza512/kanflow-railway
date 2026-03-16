import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
  ) {}

  async getInvoices(workspaceId: string, userId: string) {
    // Check workspace access
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId, ownerId: userId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return this.invoiceRepository.find({
      where: { workspaceId },
      order: { invoiceDate: 'DESC' },
    });
  }

  async getInvoice(id: string, userId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['workspace'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check workspace access
    if (invoice.workspace.ownerId !== userId) {
      throw new NotFoundException('Access denied');
    }

    return invoice;
  }

  async getPaymentMethods(workspaceId: string, userId: string) {
    // Check workspace access
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId, ownerId: userId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return this.paymentMethodRepository.find({
      where: { workspaceId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async createInvoice(invoiceData: Partial<Invoice>) {
    const invoice = this.invoiceRepository.create(invoiceData);
    return this.invoiceRepository.save(invoice);
  }

  async createPaymentMethod(paymentMethodData: Partial<PaymentMethod>) {
    // If this is set as default, unset other defaults
    if (paymentMethodData.isDefault) {
      await this.paymentMethodRepository.update(
        { workspaceId: paymentMethodData.workspaceId, isDefault: true },
        { isDefault: false },
      );
    }

    const paymentMethod = this.paymentMethodRepository.create(paymentMethodData);
    return this.paymentMethodRepository.save(paymentMethod);
  }

  async removePaymentMethod(id: string, userId: string) {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id },
      relations: ['workspace'],
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    // Check workspace access
    if (paymentMethod.workspace.ownerId !== userId) {
      throw new NotFoundException('Access denied');
    }

    await this.paymentMethodRepository.remove(paymentMethod);
    return { message: 'Payment method removed successfully' };
  }
}
