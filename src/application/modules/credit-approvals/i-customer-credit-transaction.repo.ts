import { IBaseRepo, Filter, IPageable, PageableFilter } from '../../../common';
import { CustomerCreditTransaction } from './domain';
import { CreditTransactionDocument, SearchCreditTransactionsFilter } from './domain/credit-transaction-document';

export const CUSTOMER_CREDIT_TRANSACTION_REPO = 'CUSTOMER_CREDIT_TRANSACTION_REPO';
export type ICustomerCreditTransactionRepo = IBaseRepo<
  CustomerCreditTransaction,
  string,
  PageableFilter<CustomerCreditTransaction>,
  Filter<CustomerCreditTransaction>
> & {
  searchOrgPagedAsync(filter: SearchCreditTransactionsFilter): Promise<IPageable<CreditTransactionDocument>>;
};
