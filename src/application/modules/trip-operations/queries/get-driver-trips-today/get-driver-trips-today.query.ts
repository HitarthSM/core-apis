import { AutoMap } from '@automapper/classes';
import { QueryBase } from '../../../../../common';

export class GetDriverTripsTodayQuery extends QueryBase {
  @AutoMap() public driverId: string;
  @AutoMap() public organizationId: string;
}
