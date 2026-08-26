import { QueryBase } from 'src/common';

export class ListCustomerBillsQuery extends QueryBase {
  public customerId: string;
  public organizationId: string;
  public excludeBlack: boolean = false;
  public $page?: number;
  public $perPage?: number;
}
