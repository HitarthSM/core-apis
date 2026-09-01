import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  AuthenticatedUser,
  ClerkAuthGuard,
  CqrsMediator,
  CurrentUser,
  Roles,
  RolesGuard,
  assertOrgOwnership,
  requireOrganizationId,
} from '../../../common';
import { ERole } from '../../../infrastructure';
import { Order } from '../orders/domain';
import { OrderResponse } from '../orders/models';
import { GetOrderQuery } from '../orders/queries';
import { ClaimOrderCommand } from './commands/claim-order/claim-order.command';
import { FulfillFromStoreCommand } from './commands/fulfill-from-store/fulfill-from-store.command';
import { PackOrderCommand } from './commands/pack-order/pack-order.command';
import { GetOrderQueueQuery } from './queries/get-order-queue/get-order-queue.query';
import { OrderQueueItem } from './queries/get-order-queue/get-order-queue.query-handler';
import { ClaimOrderRequest } from './models/requests/claim-order.request';
import { FulfillFromStoreRequest } from './models/requests/fulfill-from-store.request';
import { PackOrderRequest } from './models/requests/pack-order.request';
import { OrderQueueItemResponse } from './models/responses/order-queue-item.response';

@ApiBearerAuth()
@ApiTags('Warehouse Order Operations')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles(ERole.OrgAdmin, ERole.OrgManager, ERole.SuperAdmin, ERole.StoreManager, ERole.StoreStaff)
@Controller({ path: 'warehouse/orders', version: '1' })
export class OrderOperationsController {
  public constructor(
    protected readonly mediator: CqrsMediator,
    @InjectPinoLogger(OrderOperationsController.name) protected readonly logger: PinoLogger,
  ) {}

  @ApiOperation({ summary: 'Get unclaimed confirmed orders queue for a location' })
  @ApiOkResponse({ type: [OrderQueueItemResponse] })
  @HttpCode(HttpStatus.OK)
  @Get('queue')
  public async getQueue(
    @Query('locationId') locationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OrderQueueItemResponse[]> {
    const organizationId = requireOrganizationId(user);
    const query = new GetOrderQueueQuery();
    query.locationId = locationId;
    query.organizationId = organizationId;
    const items = await this.mediator.execute<GetOrderQueueQuery, OrderQueueItem[]>(query);
    return items.map((item) => ({
      id: item.id,
      orderNumber: item.orderNumber,
      customerId: item.customerId,
      locationId: item.locationId,
      status: item.status,
      totalAmount: item.totalAmount,
      createdAt: item.createdAt,
    }));
  }

  @ApiOperation({ summary: 'Claim an order for picking' })
  @ApiOkResponse({ type: Boolean })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @HttpCode(HttpStatus.OK)
  @Post(':id/claim')
  public async claimOrder(
    @Param('id') id: string,
    @Body() body: ClaimOrderRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    const organizationId = requireOrganizationId(user);
    const command = new ClaimOrderCommand();
    command.orderId = id;
    command.pickerUserId = body.pickerUserId;
    command.organizationId = organizationId;
    await this.mediator.execute<ClaimOrderCommand, Order>(command);
    return true;
  }

  @ApiOperation({ summary: 'Pack an order after picking' })
  @ApiOkResponse({ type: Boolean })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @HttpCode(HttpStatus.OK)
  @Post(':id/pack')
  public async packOrder(
    @Param('id') id: string,
    @Body() body: PackOrderRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    const organizationId = requireOrganizationId(user);
    const command = new PackOrderCommand();
    command.orderId = id;
    command.packerUserId = body.packerUserId;
    command.organizationId = organizationId;
    command.items = body.items;
    await this.mediator.execute<PackOrderCommand, Order>(command);
    return true;
  }

  @ApiOperation({ summary: 'Fulfill an order directly from store (skip warehouse claim/pack)' })
  @ApiOkResponse({ type: Boolean })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @HttpCode(HttpStatus.OK)
  @Patch(':id/fulfill-from-store')
  public async fulfillFromStore(
    @Param('id') id: string,
    @Body() body: FulfillFromStoreRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    const organizationId = requireOrganizationId(user);
    const command = new FulfillFromStoreCommand();
    command.orderId = id;
    command.userId = body.userId;
    command.organizationId = organizationId;
    await this.mediator.execute<FulfillFromStoreCommand, Order>(command);
    return true;
  }

  @ApiOperation({ summary: 'Get order by ID' })
  @ApiOkResponse({ type: OrderResponse })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  public async getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Order> {
    assertOrgOwnership(user, requireOrganizationId(user), 'order');
    const query = new GetOrderQuery();
    query.id = id;
    return this.mediator.execute<GetOrderQuery, Order>(query);
  }
}
