jest.mock('../../../../../common', () => ({
  QueryHandlerStrict: () => () => undefined,
  QueryBase: class QueryBase {},
}));

import { SearchCreditTransactionsQuery } from './search-credit-transactions.query';
import { SearchCreditTransactionsQueryHandler } from './search-credit-transactions.query-handler';

describe('SearchCreditTransactionsQueryHandler', () => {
  it('passes organizationId and filters to repo.searchOrgPagedAsync', async () => {
    const repo = {
      searchOrgPagedAsync: jest.fn().mockResolvedValue({
        items: [],
        page: 1,
        perPage: 20,
        totalCount: 0,
        totalPages: 0,
      }),
    };
    const handler = new SearchCreditTransactionsQueryHandler(repo as any, { info: jest.fn() } as any);
    const query = Object.assign(new SearchCreditTransactionsQuery(), {
      organizationId: 'org-1',
      type: 'payment',
      search: 'Ann',
      $page: 2,
      $perPage: 10,
    });

    await handler.execute(query);

    expect(repo.searchOrgPagedAsync).toHaveBeenCalledWith({
      organizationId: 'org-1',
      type: 'payment',
      customerId: undefined,
      search: 'Ann',
      $page: 2,
      $perPage: 10,
    });
  });
});
