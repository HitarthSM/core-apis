import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { BaseRepo, countPages, Filter, IPageable, PageableFilter } from '../../../common';
import { CustomerCreditTransactionEntity } from '../entities';
import {
  CreditTransactionDocument,
  CustomerCreditTransaction,
  SearchCreditTransactionsFilter,
} from '../../../application/modules/credit-approvals/domain';
import { ICustomerCreditTransactionRepo } from '../../../application/modules/credit-approvals/i-customer-credit-transaction.repo';

@Injectable()
export class CustomerCreditTransactionRepo
  extends BaseRepo<
    CustomerCreditTransactionEntity,
    CustomerCreditTransaction,
    string,
    PageableFilter<CustomerCreditTransaction>,
    Filter<CustomerCreditTransaction>
  >
  implements ICustomerCreditTransactionRepo
{
  constructor(
    @InjectRepository(CustomerCreditTransactionEntity) internalRepo: Repository<CustomerCreditTransactionEntity>,
    @InjectMapper() mapper: Mapper,
    @InjectPinoLogger(CustomerCreditTransactionRepo.name) logger: PinoLogger,
  ) {
    super(internalRepo, mapper, logger, CustomerCreditTransactionEntity, CustomerCreditTransaction);
  }

  public override get idColumnName(): keyof CustomerCreditTransactionEntity {
    return 'id';
  }

  public async searchOrgPagedAsync(
    filter: SearchCreditTransactionsFilter,
  ): Promise<IPageable<CreditTransactionDocument>> {
    const { organizationId, type, customerId, search, $page, $perPage } = filter;
    const query = this.internalRepo
      .createQueryBuilder('tx')
      .innerJoin('tx.customer', 'customer')
      .leftJoin('tx.bill', 'bill')
      .addSelect('customer')
      .addSelect('bill')
      .where('customer.organizationId = :organizationId', { organizationId });

    if (type) {
      query.andWhere('tx.type = :type', { type });
    }
    if (customerId) {
      query.andWhere('tx.customerId = :customerId', { customerId });
    }
    if (search) {
      query.andWhere('(customer.name ILIKE :q OR bill.billNumber ILIKE :q OR tx.note ILIKE :q)', {
        q: `%${search}%`,
      });
    }

    const [entities, totalCount] = await query
      .orderBy('tx.createdAt', 'DESC')
      .skip($perPage * ($page - 1))
      .take($perPage)
      .getManyAndCount();

    return {
      items: entities.map((entity) => ({
        id: entity.id,
        customerId: entity.customerId,
        customerName: entity.customer?.name ?? null,
        billId: entity.billId ?? null,
        billNumber: entity.bill?.billNumber ?? null,
        walkInName: entity.bill?.walkInName ?? null,
        type: entity.type,
        amount: entity.amount,
        balanceBefore: entity.balanceBefore,
        balanceAfter: entity.balanceAfter,
        paymentMethod: entity.paymentMethod ?? null,
        note: entity.note ?? null,
        subtotal: entity.bill?.subtotal ?? null,
        discountAmount: entity.bill?.discountAmount ?? null,
        taxAmount: entity.bill?.taxAmount ?? null,
        totalAmount: entity.bill?.totalAmount ?? null,
        billedAt: entity.bill?.billedAt ?? null,
        createdAt: entity.createdAt,
      })),
      page: $page,
      perPage: $perPage,
      totalCount,
      totalPages: countPages(totalCount, $perPage),
    };
  }
}
