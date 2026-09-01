import { AutoMap } from '@automapper/classes';

export class Inventory {
  @AutoMap() public id: string;
  @AutoMap() public organizationId: string;
  @AutoMap() public locationId: string;
  @AutoMap() public productId: string;
  @AutoMap() public quantityOnHand: number;
  @AutoMap() public quantityReserved: number;
  @AutoMap() public reorderLevel: number;
  @AutoMap() public maxStock?: number;
  @AutoMap() public averageCost?: number;
  @AutoMap() public binLocation?: string;
  @AutoMap() public quantityUnpublished: number;
  @AutoMap() public productPackSize?: number;
  @AutoMap() public packsOnHand?: number;
  @AutoMap() public looseUnits?: number;
  @AutoMap(() => Date) public createdAt?: Date;
  @AutoMap(() => Date) public updatedAt?: Date;
}
