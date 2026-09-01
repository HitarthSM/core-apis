export * from './get-customer';
export * from './search-customers';
export * from './list-customer-bills';
export * from './list-customer-credit-transactions';
export * from './export-customer-statement';

import { GetCustomerQueryHandler } from './get-customer';
import { SearchCustomersQueryHandler } from './search-customers';
import { ListCustomerBillsQueryHandler } from './list-customer-bills';
import { ListCustomerCreditTransactionsQueryHandler } from './list-customer-credit-transactions';
import { ExportCustomerStatementQueryHandler } from './export-customer-statement';

export const CustomerQueryHandlers = [
  GetCustomerQueryHandler,
  SearchCustomersQueryHandler,
  ListCustomerBillsQueryHandler,
  ListCustomerCreditTransactionsQueryHandler,
  ExportCustomerStatementQueryHandler,
];
