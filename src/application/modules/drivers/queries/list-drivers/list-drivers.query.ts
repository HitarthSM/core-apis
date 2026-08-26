import { AutoMap } from '@automapper/classes';
import { EOrder, Filter, QueryBase } from 'src/common';
import { Driver } from '../../domain';

export class ListDriversQuery extends QueryBase implements Filter<Driver, string> {
  @AutoMap() public organizationId?: string;
  @AutoMap() public firstName?: string;
  @AutoMap() public $orderBy?: string;
  @AutoMap() public $order?: EOrder;
}
