import { QueryBase } from '../../../../../common';
import { CreditTransactionDocumentType } from '../../domain';

export class SearchCreditTransactionsQuery extends QueryBase {
  public organizationId: string;
  public type?: CreditTransactionDocumentType;
  public customerId?: string;
  public search?: string;
  public $page?: number;
  public $perPage?: number;
}
