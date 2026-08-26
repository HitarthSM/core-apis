import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { PurchaseItemAllocationEntity, PurchaseOrderEntity } from '../../../../infrastructure/persistence/entities';
import { PurchaseItemAllocation, PurchaseOrder } from '../domain';
import { CreatePurchaseOrderRequest, ListPurchaseOrdersRequest, PurchaseOrderResponse, SearchPurchaseOrdersRequest, UpdatePurchaseOrderRequest } from '../models';
import { CreatePurchaseOrderCommand, UpdatePurchaseOrderCommand } from '../commands';
import { ListPurchaseOrdersQuery, SearchPurchaseOrdersQuery } from '../queries';

@Injectable()
export class PurchaseOrderProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) { super(mapper); }

  public get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, PurchaseOrderEntity, PurchaseOrder);
      createMap(mapper, PurchaseOrder, PurchaseOrderEntity);
      createMap(mapper, PurchaseItemAllocationEntity, PurchaseItemAllocation);
      createMap(mapper, PurchaseItemAllocation, PurchaseItemAllocationEntity);
      createMap(mapper, SearchPurchaseOrdersRequest, SearchPurchaseOrdersQuery);
      createMap(mapper, ListPurchaseOrdersRequest, ListPurchaseOrdersQuery);
      createMap(mapper, CreatePurchaseOrderRequest, CreatePurchaseOrderCommand);
      createMap(mapper, CreatePurchaseOrderCommand, PurchaseOrder);
      createMap(mapper, UpdatePurchaseOrderRequest, UpdatePurchaseOrderCommand);
      createMap(mapper, UpdatePurchaseOrderCommand, PurchaseOrder);
      createMap(mapper, PurchaseOrder, PurchaseOrderResponse);
    };
  }
}
