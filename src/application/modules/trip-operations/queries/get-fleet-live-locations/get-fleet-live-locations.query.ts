import { AutoMap } from '@automapper/classes';
import { QueryBase } from '../../../../../common';

export class GetFleetLiveLocationsQuery extends QueryBase {
  @AutoMap() public organizationId: string;
}
