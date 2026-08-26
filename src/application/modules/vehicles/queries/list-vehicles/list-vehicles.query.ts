import { AutoMap } from '@automapper/classes';
import { EOrder, Filter, QueryBase } from 'src/common';
import { Vehicle } from '../../domain';

export class ListVehiclesQuery extends QueryBase implements Filter<Vehicle, string> {
  @AutoMap() public companyId?: string;
  @AutoMap() public vehicleNumber?: string;
  @AutoMap() public $orderBy?: string;
  @AutoMap() public $order?: EOrder;
}
