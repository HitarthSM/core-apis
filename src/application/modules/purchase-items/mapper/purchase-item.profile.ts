import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { PurchaseItem } from '../domain';
import { CreatePurchaseItemRequest, PurchaseItemResponse } from '../models';
import { CreatePurchaseItemCommand } from '../commands';
import { PurchaseItemEntity } from 'src/infrastructure';

@Injectable()
export class PurchaseItemProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) { super(mapper); }

  public get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, PurchaseItemEntity, PurchaseItem);
      createMap(mapper, PurchaseItem, PurchaseItemEntity);
      createMap(mapper, CreatePurchaseItemRequest, CreatePurchaseItemCommand);
      createMap(
        mapper,
        CreatePurchaseItemCommand,
        PurchaseItem,
        forMember(dest => dest.totalCost, mapFrom(src => (src.quantityOrdered ?? 0) * src.unitCost)),
        forMember(dest => dest.quantityReceived, mapFrom(() => 0)),
      );
      createMap(mapper, PurchaseItem, PurchaseItemResponse);
    };
  }
}
