import { Inject } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommandHandlerStrict } from '../../../../../common';
import { BILL_REPO, CUSTOMER_REPO, ORDER_REPO } from '../../../../constants';
import { Order } from '../../domain';
import { IOrderRepo } from '../..';
import { CreateOrderCommand } from './create-order.command';
import { OrdersMailService } from '../../mail';
import { IPushNotificationService, PUSH_NOTIFICATION_SERVICE } from '../../../../../common';
import { IBillRepo } from '../../../bills';
import { Bill } from '../../../bills/domain';
import { generateBillNumber } from '../../../bills/helpers';
import { EBillStatus, ESaleType } from '../../../../../infrastructure/persistence/entities';

@CommandHandlerStrict(CreateOrderCommand)
export class CreateOrderCommandHandler implements ICommandHandler<CreateOrderCommand, Order> {
  constructor(
    @Inject(ORDER_REPO) private readonly repo: IOrderRepo,
    @Inject(BILL_REPO) private readonly billRepo: IBillRepo,
    @Inject(CUSTOMER_REPO) private readonly customerRepo: { getAsync: (id: string) => Promise<{ email?: string; name?: string } | null> },
    private readonly mailService: OrdersMailService,
    @Inject(PUSH_NOTIFICATION_SERVICE) private readonly pushService: IPushNotificationService,
    @InjectPinoLogger(CreateOrderCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: CreateOrderCommand): Promise<Order> {
    this.logger.info(`Executing ${CreateOrderCommand.name}`);
    const orderData = {
      ...command,
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    const order = await this.repo.createAsync(orderData as never);
    await this.createOrderBillAsync(order).catch((err: Error) =>
      this.logger.warn({ error: err.message }, 'Auto-bill creation failed — non-fatal'),
    );
    await this.sendOrderConfirmedAsync(order).catch((err: Error) =>
      this.logger.warn({ error: err.message }, 'Order confirmed mail failed — non-fatal'),
    );
    await this.sendOrderPushAsync(order).catch((err: Error) =>
      this.logger.warn({ error: err.message }, 'Order push notification failed — non-fatal'),
    );
    return order;
  }

  private async createOrderBillAsync(order: Order): Promise<void> {
    if (!order.organizationId || !order.locationId) return;
    const bill = new Bill();
    bill.billNumber = generateBillNumber();
    bill.organizationId = order.organizationId;
    bill.locationId = order.locationId;
    bill.customerId = order.customerId;
    bill.sourceOrderId = order.id;
    bill.status = EBillStatus.Initiated;
    bill.saleType = ESaleType.Normal;
    bill.subtotal = Number(order.totalAmount ?? 0);
    bill.taxAmount = 0;
    bill.discountAmount = 0;
    bill.totalAmount = Number(order.totalAmount ?? 0);
    bill.blackAmount = 0;
    bill.commissionAmount = 0;
    await this.billRepo.createAsync(bill);
  }

  private async sendOrderConfirmedAsync(order: Order): Promise<void> {
    if (!order.customerId) return;
    const customer = await this.customerRepo.getAsync(order.customerId);
    if (!customer?.email) return;

    const fmt = (n: number): string =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(n));

    await this.mailService.sendTemplatedAsync(customer.email, 'order-confirmed', {
      customerName:  customer.name ?? 'Valued Customer',
      orderNumber:   order.orderNumber,
      status:        order.status,
      totalAmount:   fmt(order.totalAmount),
      createdAt:     order.createdAt?.toLocaleDateString('en-IN') ?? new Date().toLocaleDateString('en-IN'),
    });
  }

  private async sendOrderPushAsync(order: Order): Promise<void> {
    if (!order.organizationId) return;
    await this.pushService.broadcastToOrgAsync(
      order.organizationId,
      'ORDER_CREATED',
      `New order ${order.orderNumber}`,
      `Order placed — total ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(order.totalAmount))}`,
      { orderId: order.id },
    );
  }
}
