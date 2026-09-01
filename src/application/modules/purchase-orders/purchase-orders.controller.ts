import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  AuthenticatedUser,
  ClerkAuthGuard,
  CqrsMediator,
  CurrentUser,
  IPageable,
  InventoryNotOwnedByOrgException,
  PdfDocument,
  Roles,
  RolesGuard,
} from '../../../common';
import { ERole } from '../../../infrastructure';
import {
  AllocatePurchaseOrderCommand,
  CreatePurchaseOrderCommand,
  DeletePurchaseOrderCommand,
  ReceivePurchaseOrderCommand,
  UpdatePurchaseOrderCommand,
} from './commands';
import { PurchaseOrder } from './domain';
import {
  AllocatePurchaseOrderRequest,
  CreatePurchaseOrderRequest,
  ListPurchaseOrdersRequest,
  PurchaseOrderResponse,
  PurchaseOrdersPagedResponse,
  ReceivePurchaseOrderRequest,
  SearchPurchaseOrdersRequest,
  UpdatePurchaseOrderRequest,
} from './models';
import { ExportPurchaseOrderQuery, GetPurchaseOrderQuery, ListPurchaseOrdersQuery, SearchPurchaseOrdersQuery } from './queries';

@ApiBearerAuth()
@ApiTags('PurchaseOrders')
@Controller({ path: 'purchase-orders', version: '1' })
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles(ERole.OrgAdmin, ERole.SuperAdmin)
export class PurchaseOrdersController {
  constructor(
    protected readonly mediator: CqrsMediator,
    @InjectMapper() protected readonly mapper: Mapper,
    @InjectPinoLogger(PurchaseOrdersController.name) protected readonly logger: PinoLogger,
  ) {}

  @ApiOperation({ summary: 'Search purchase orders (paginated)' })
  @ApiOkResponse({ type: PurchaseOrdersPagedResponse })
  @HttpCode(HttpStatus.OK)
  @Get()
  public async search(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filter?: SearchPurchaseOrdersRequest,
  ): Promise<PurchaseOrdersPagedResponse> {
    if (!user.organizationId) return { items: [], page: 1, perPage: 15, totalCount: 0, totalPages: 0 };
    const query          = this.mapper.map(filter, SearchPurchaseOrdersRequest, SearchPurchaseOrdersQuery);
    query.organizationId = user.organizationId;
    const result         = await this.mediator.execute<SearchPurchaseOrdersQuery, IPageable<PurchaseOrder>>(query);
    return {
      ...result,
      items: this.mapper.mapArray(result.items, PurchaseOrder, PurchaseOrderResponse),
    };
  }

  @ApiOperation({ summary: 'List all purchase orders' })
  @ApiOkResponse({ type: [PurchaseOrderResponse] })
  @HttpCode(HttpStatus.OK)
  @Get('list')
  public async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filter?: ListPurchaseOrdersRequest,
  ): Promise<PurchaseOrderResponse[]> {
    if (!user.organizationId) return [];
    const query          = this.mapper.map(filter, ListPurchaseOrdersRequest, ListPurchaseOrdersQuery);
    query.organizationId = user.organizationId;
    const result         = await this.mediator.execute<ListPurchaseOrdersQuery, PurchaseOrder[]>(query);
    return this.mapper.mapArray(result, PurchaseOrder, PurchaseOrderResponse);
  }

  @ApiOperation({ summary: 'Get purchase order by ID' })
  @ApiOkResponse({ type: PurchaseOrderResponse })
  @ApiParam({ name: 'id', description: 'Purchase Order UUID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  public async getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<PurchaseOrderResponse> {
    const query  = new GetPurchaseOrderQuery();
    query.id     = id;
    const result = await this.mediator.execute<GetPurchaseOrderQuery, PurchaseOrder>(query);
    if (result.organizationId !== user.organizationId) throw new InventoryNotOwnedByOrgException();
    return this.mapper.map(result, PurchaseOrder, PurchaseOrderResponse);
  }

  @ApiOperation({ summary: 'Export purchase order as PDF' })
  @ApiParam({ name: 'id', description: 'Purchase Order UUID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id/pdf')
  public async exportPdf(
    @Param('id') id: string,
    @Res() res: Response,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    const fetchQuery  = new GetPurchaseOrderQuery();
    fetchQuery.id     = id;
    const existing    = await this.mediator.execute<GetPurchaseOrderQuery, PurchaseOrder>(fetchQuery);
    if (existing.organizationId !== user.organizationId) throw new InventoryNotOwnedByOrgException();
    const query       = new ExportPurchaseOrderQuery();
    query.id          = id;
    const doc: PdfDocument = await this.mediator.execute<ExportPurchaseOrderQuery, PdfDocument>(query);
    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${doc.filename}"`,
      'Content-Length':      String(doc.buffer.byteLength),
    });
    res.end(doc.buffer);
  }

  @ApiOperation({ summary: 'Create a new purchase order with line items' })
  @ApiCreatedResponse({ type: PurchaseOrderResponse })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  public async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePurchaseOrderRequest,
  ): Promise<PurchaseOrderResponse> {
    const command          = this.mapper.map(body, CreatePurchaseOrderRequest, CreatePurchaseOrderCommand);
    command.organizationId = user.organizationId;
    command.createdById    = user.dbUserId;
    command.items          = body.items;
    const result           = await this.mediator.execute<CreatePurchaseOrderCommand, PurchaseOrder>(command);
    return this.mapper.map(result, PurchaseOrder, PurchaseOrderResponse);
  }

  @ApiOperation({ summary: 'Update purchase order status / notes / expected date' })
  @ApiOkResponse({ type: PurchaseOrderResponse })
  @ApiParam({ name: 'id', description: 'Purchase Order UUID' })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Body() body: UpdatePurchaseOrderRequest,
  ): Promise<PurchaseOrderResponse> {
    const command = this.mapper.map(body, UpdatePurchaseOrderRequest, UpdatePurchaseOrderCommand);
    command.id    = id;
    const result  = await this.mediator.execute<UpdatePurchaseOrderCommand, PurchaseOrder>(command);
    return this.mapper.map(result, PurchaseOrder, PurchaseOrderResponse);
  }

  @ApiOperation({ summary: 'Record received quantities for purchase order items (does not add stock)' })
  @ApiOkResponse({ type: PurchaseOrderResponse })
  @ApiParam({ name: 'id', description: 'Purchase Order UUID' })
  @HttpCode(HttpStatus.OK)
  @Post(':id/receive')
  public async receive(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: ReceivePurchaseOrderRequest,
  ): Promise<PurchaseOrderResponse> {
    const command           = new ReceivePurchaseOrderCommand();
    command.purchaseOrderId = id;
    command.organizationId  = user.organizationId;
    command.items           = body.items;
    command.performedById   = user.dbUserId;
    command.notes           = body.notes;
    const result            = await this.mediator.execute<ReceivePurchaseOrderCommand, PurchaseOrder>(command);
    return this.mapper.map(result, PurchaseOrder, PurchaseOrderResponse);
  }

  @ApiOperation({ summary: 'Allocate received stock to specific locations — adds stock to inventory' })
  @ApiOkResponse({ type: PurchaseOrderResponse })
  @ApiParam({ name: 'id', description: 'Purchase Order UUID' })
  @HttpCode(HttpStatus.OK)
  @Post(':id/allocate')
  public async allocate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: AllocatePurchaseOrderRequest,
  ): Promise<PurchaseOrderResponse> {
    const command           = new AllocatePurchaseOrderCommand();
    command.purchaseOrderId = id;
    command.organizationId  = user.organizationId;
    command.allocations     = body.allocations;
    command.performedById   = user.dbUserId;
    command.notes           = body.notes;
    const result            = await this.mediator.execute<AllocatePurchaseOrderCommand, PurchaseOrder>(command);
    return this.mapper.map(result, PurchaseOrder, PurchaseOrderResponse);
  }

  @ApiOperation({ summary: 'Delete a purchase order' })
  @ApiOkResponse({ type: Boolean })
  @ApiParam({ name: 'id', description: 'Purchase Order UUID' })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  public async delete(@Param('id') id: string): Promise<boolean> {
    const command = new DeletePurchaseOrderCommand();
    command.id    = id;
    return this.mediator.execute<DeletePurchaseOrderCommand, boolean>(command);
  }
}
