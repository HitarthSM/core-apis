import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ClerkAuthGuard, CqrsMediator, RolesGuard, Roles, CurrentUser, AuthenticatedUser, assertOrgOwnership, requireOrganizationId } from '../../../common';
import { IPageable } from '../../../common';
import { ERole } from '../../../infrastructure';
import { GetLocationQuery, ListLocationsQuery } from '../locations/queries';
import { Location } from '../locations/domain';
import { CreateItemReturnCommand, DeleteItemReturnCommand, UpdateItemReturnCommand } from './commands';
import { ItemReturn } from './domain';
import { CreateItemReturnRequest, SearchItemReturnsRequest, ListItemReturnsRequest, ItemReturnResponse, ItemReturnsPagedResponse, UpdateItemReturnRequest } from './models';
import { GetItemReturnQuery, ListItemReturnsQuery, SearchItemReturnsQuery } from './queries';

@ApiBearerAuth()
@ApiTags('Item Returns')
@UseGuards(ClerkAuthGuard)
@Controller({ path: 'item-returns', version: '1' })
export class ItemReturnsController {
  constructor(
    protected readonly mediator: CqrsMediator,
    @InjectMapper() protected readonly mapper: Mapper,
    @InjectPinoLogger(ItemReturnsController.name) protected readonly logger: PinoLogger,
  ) {}

  @ApiOperation({ summary: 'Search item returns (paginated)' })
  @ApiOkResponse({ type: ItemReturnsPagedResponse })
  @HttpCode(HttpStatus.OK)
  @Get()
  public async search(@Query() filter?: SearchItemReturnsRequest, @CurrentUser() user?: AuthenticatedUser): Promise<ItemReturnsPagedResponse> {
    const query = this.mapper.map(filter, SearchItemReturnsRequest, SearchItemReturnsQuery);
    const result = await this.mediator.execute<SearchItemReturnsQuery, IPageable<ItemReturn>>(query);
    const orgLocationIds = await this.orgLocationIds(user);
    const items = result.items.filter((r) => orgLocationIds.has(r.locationId));
    return {
      ...result,
      items: this.mapper.mapArray(items, ItemReturn, ItemReturnResponse),
    };
  }

  @ApiOperation({ summary: 'List all item returns' })
  @ApiOkResponse({ type: [ItemReturnResponse] })
  @HttpCode(HttpStatus.OK)
  @Get('list')
  public async list(@Query() filter?: ListItemReturnsRequest, @CurrentUser() user?: AuthenticatedUser): Promise<ItemReturnResponse[]> {
    const query = this.mapper.map(filter, ListItemReturnsRequest, ListItemReturnsQuery);
    const result = await this.mediator.execute<ListItemReturnsQuery, ItemReturn[]>(query);
    const orgLocationIds = await this.orgLocationIds(user);
    return this.mapper.mapArray(result.filter((r) => orgLocationIds.has(r.locationId)), ItemReturn, ItemReturnResponse);
  }

  // ponytail: filters cross-org rows out in memory after fetch, since ItemReturn carries no
  // organizationId column to push the check down to the DB (only locationId -> location.organizationId).
  // Upgrade to a DB-level join filter if return volume makes the unfiltered fetch/search-count too slow.
  private async orgLocationIds(user?: AuthenticatedUser): Promise<Set<string>> {
    const locationsQuery = new ListLocationsQuery();
    locationsQuery.organizationId = requireOrganizationId(user);
    const locations = await this.mediator.execute<ListLocationsQuery, Location[]>(locationsQuery);
    return new Set(locations.map((l) => l.id));
  }

  @ApiOperation({ summary: 'Get item return by ID' })
  @ApiOkResponse({ type: ItemReturnResponse })
  @ApiParam({ name: 'id', description: 'Item Return UUID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  public async getById(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<ItemReturnResponse> {
    const query = new GetItemReturnQuery();
    query.id = id;
    const result = await this.mediator.execute<GetItemReturnQuery, ItemReturn>(query);

    const locationQuery = new GetLocationQuery();
    locationQuery.id = result.locationId;
    const location = await this.mediator.execute<GetLocationQuery, Location>(locationQuery);
    assertOrgOwnership(user, location.organizationId, 'item return');

    return this.mapper.map(result, ItemReturn, ItemReturnResponse);
  }

  @ApiOperation({ summary: 'Create a new item return' })
  @ApiCreatedResponse({ type: ItemReturnResponse })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  public async create(@Body() body: CreateItemReturnRequest, @CurrentUser() user: AuthenticatedUser): Promise<ItemReturnResponse> {
    const command = this.mapper.map(body, CreateItemReturnRequest, CreateItemReturnCommand);

    const locationQuery = new GetLocationQuery();
    locationQuery.id = command.locationId;
    const location = await this.mediator.execute<GetLocationQuery, Location>(locationQuery);
    assertOrgOwnership(user, location.organizationId, 'item return');

    const result  = await this.mediator.execute<CreateItemReturnCommand, ItemReturn>(command);
    return this.mapper.map(result, ItemReturn, ItemReturnResponse);
  }

  @ApiOperation({ summary: 'Update a item return' })
  @ApiOkResponse({ type: ItemReturnResponse })
  @ApiParam({ name: 'id', description: 'Item Return UUID' })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  public async update(@Param('id') id: string, @Body() body: UpdateItemReturnRequest, @CurrentUser() user: AuthenticatedUser): Promise<ItemReturnResponse> {
    const getQuery = new GetItemReturnQuery();
    getQuery.id = id;
    const existing = await this.mediator.execute<GetItemReturnQuery, ItemReturn>(getQuery);

    const locationQuery = new GetLocationQuery();
    locationQuery.id = existing.locationId;
    const location = await this.mediator.execute<GetLocationQuery, Location>(locationQuery);
    assertOrgOwnership(user, location.organizationId, 'item return');

    const command = this.mapper.map(body, UpdateItemReturnRequest, UpdateItemReturnCommand);
    command.id    = id;
    const result  = await this.mediator.execute<UpdateItemReturnCommand, ItemReturn>(command);
    return this.mapper.map(result, ItemReturn, ItemReturnResponse);
  }

  @ApiOperation({ summary: 'Delete a item return' })
  @ApiOkResponse({ type: Boolean })
  @ApiParam({ name: 'id', description: 'Item Return UUID' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(ERole.StoreManager, ERole.OrgManager, ERole.OrgAdmin, ERole.SuperAdmin)
  @Delete(':id')
  public async delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<boolean> {
    const getQuery = new GetItemReturnQuery();
    getQuery.id = id;
    const existing = await this.mediator.execute<GetItemReturnQuery, ItemReturn>(getQuery);

    const locationQuery = new GetLocationQuery();
    locationQuery.id = existing.locationId;
    const location = await this.mediator.execute<GetLocationQuery, Location>(locationQuery);
    assertOrgOwnership(user, location.organizationId, 'item return');

    const command = new DeleteItemReturnCommand();
    command.id    = id;
    return this.mediator.execute<DeleteItemReturnCommand, boolean>(command);
  }
}
