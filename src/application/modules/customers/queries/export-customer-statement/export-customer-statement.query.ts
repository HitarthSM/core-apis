import { AutoMap } from '@automapper/classes';
import { QueryBase } from '../../../../../common';

export class ExportCustomerStatementQuery extends QueryBase {
  @AutoMap() public customerId: string;
}
