jest.mock('@automapper/core', () => ({}));
jest.mock('@automapper/nestjs', () => ({ InjectMapper: () => () => undefined }));
jest.mock('@nestjs/typeorm', () => ({ InjectRepository: () => () => undefined }));
jest.mock('typeorm', () => ({}));
jest.mock('../../../../common', () => ({
  BaseRepo: class BaseRepo {
    protected internalRepo: unknown;

    constructor(internalRepo: unknown) {
      this.internalRepo = internalRepo;
    }
  },
  countPages: (count: number, perPage: number) => Math.ceil(count / perPage),
}));
jest.mock('../../../../infrastructure/persistence/entities', () => ({
  CustomerCreditTransactionEntity: class CustomerCreditTransactionEntity {},
}));
jest.mock('./index', () => ({ CustomerCreditTransaction: class CustomerCreditTransaction {} }));

import { CustomerCreditTransactionRepo } from '../../../../infrastructure/persistence/repositories/customer-credit-transaction.repo';

describe('CustomerCreditTransactionRepo.searchOrgPagedAsync', () => {
  it('builds an org-scoped query and maps joined credit documents', async () => {
    const createdAt = new Date('2026-08-25T10:00:00.000Z');
    const billedAt = new Date('2026-08-24T10:00:00.000Z');
    const entity = {
      id: 'transaction-id',
      customerId: 'customer-id',
      billId: 'bill-id',
      type: 'credit_sale',
      amount: 125,
      balanceBefore: 200,
      balanceAfter: 325,
      paymentMethod: 'CREDIT',
      note: 'August invoice',
      createdAt,
      customer: { name: 'Acme Stores' },
      bill: {
        billNumber: 'BILL-001',
        walkInName: null,
        subtotal: 100,
        discountAmount: 5,
        taxAmount: 30,
        totalAmount: 125,
        billedAt,
      },
    };
    const queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[entity], 5]),
    };
    const internalRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const repo = new CustomerCreditTransactionRepo(internalRepo as never, {} as never, {} as never);

    const result = await repo.searchOrgPagedAsync({
      organizationId: 'organization-id',
      type: 'credit_sale',
      customerId: 'customer-id',
      search: 'Acme',
      $page: 2,
      $perPage: 2,
    });

    expect(internalRepo.createQueryBuilder).toHaveBeenCalledWith('tx');
    expect(queryBuilder.innerJoin).toHaveBeenCalledWith('tx.customer', 'customer');
    expect(queryBuilder.leftJoin).toHaveBeenCalledWith('tx.bill', 'bill');
    expect(queryBuilder.addSelect).toHaveBeenCalledWith('customer');
    expect(queryBuilder.addSelect).toHaveBeenCalledWith('bill');
    expect(queryBuilder.where).toHaveBeenCalledWith('customer.organizationId = :organizationId', {
      organizationId: 'organization-id',
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('tx.type = :type', { type: 'credit_sale' });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('tx.customerId = :customerId', {
      customerId: 'customer-id',
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      '(customer.name ILIKE :q OR bill.billNumber ILIKE :q OR tx.note ILIKE :q)',
      { q: '%Acme%' },
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('tx.createdAt', 'DESC');
    expect(queryBuilder.skip).toHaveBeenCalledWith(2);
    expect(queryBuilder.take).toHaveBeenCalledWith(2);
    expect(result).toEqual({
      items: [
        {
          id: 'transaction-id',
          customerId: 'customer-id',
          customerName: 'Acme Stores',
          billId: 'bill-id',
          billNumber: 'BILL-001',
          walkInName: null,
          type: 'credit_sale',
          amount: 125,
          balanceBefore: 200,
          balanceAfter: 325,
          paymentMethod: 'CREDIT',
          note: 'August invoice',
          subtotal: 100,
          discountAmount: 5,
          taxAmount: 30,
          totalAmount: 125,
          billedAt,
          createdAt,
        },
      ],
      page: 2,
      perPage: 2,
      totalCount: 5,
      totalPages: 3,
    });
  });
});
