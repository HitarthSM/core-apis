import { AutoMap } from '@automapper/classes';
import { QueryBase } from '../../../../../common';

export class GetOrderQueueQuery extends QueryBase {
  @AutoMap() public locationId: string;
  @AutoMap() public organizationId: string;
}
