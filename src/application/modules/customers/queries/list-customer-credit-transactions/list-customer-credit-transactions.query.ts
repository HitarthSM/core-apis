import { QueryBase } from 'src/common';

export class ListCustomerCreditTransactionsQuery extends QueryBase {
  public customerId: string;
  public organizationId: string;
  public $page?: number;
  public $perPage?: number;
}
