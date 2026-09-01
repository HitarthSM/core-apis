import { Inject } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { IPageable, QueryHandlerStrict } from '../../../../../common';
import { CUSTOMER_CREDIT_TRANSACTION_REPO } from '../../../../constants';
import { CreditTransactionDocument } from '../../domain';
import { ICustomerCreditTransactionRepo } from '../../i-customer-credit-transaction.repo';
import { SearchCreditTransactionsQuery } from './search-credit-transactions.query';

@QueryHandlerStrict(SearchCreditTransactionsQuery)
export class SearchCreditTransactionsQueryHandler implements IQueryHandler<SearchCreditTransactionsQuery, IPageable<CreditTransactionDocument>> {
  constructor(
    @Inject(CUSTOMER_CREDIT_TRANSACTION_REPO) private readonly repo: ICustomerCreditTransactionRepo,
    @InjectPinoLogger(SearchCreditTransactionsQueryHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(query: SearchCreditTransactionsQuery): Promise<IPageable<CreditTransactionDocument>> {
    this.logger.info(`Executing ${SearchCreditTransactionsQuery.name}`);
    return this.repo.searchOrgPagedAsync({
      organizationId: query.organizationId,
      type: query.type,
      customerId: query.customerId,
      search: query.search,
      $page: query.$page ?? 1,
      $perPage: query.$perPage ?? 20,
    });
  }
}
