import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, ClerkAuthGuard, CqrsMediator, CurrentUser, IPageable, Roles, RolesGuard, requireOrganizationId } from '../../../common';
import { ERole } from '../../../infrastructure/persistence/entities/role.entity';
import { CreditTransactionDocument } from './domain';
import { CreditTransactionsDocumentsPagedResponse, SearchCreditTransactionsRequest } from './models';
import { SearchCreditTransactionsQuery } from './queries';

@ApiBearerAuth()
@ApiTags('Credit Transactions')
@Controller({ path: 'credit-transactions', version: '1' })
@UseGuards(ClerkAuthGuard, RolesGuard)
export class CreditTransactionsController {
  constructor(protected readonly mediator: CqrsMediator) {}

  @ApiOperation({ summary: 'Search organization credit transactions' })
  @ApiOkResponse({ type: CreditTransactionsDocumentsPagedResponse })
  @Get()
  @Roles(ERole.StoreManager, ERole.OrgManager, ERole.OrgAdmin, ERole.SuperAdmin)
  @HttpCode(HttpStatus.OK)
  public async search(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filter: SearchCreditTransactionsRequest,
  ): Promise<CreditTransactionsDocumentsPagedResponse> {
    const organizationId = requireOrganizationId(user);
    const query = new SearchCreditTransactionsQuery();
    query.organizationId = organizationId;
    query.type = filter.type;
    query.customerId = filter.customerId;
    query.search = filter.search;
    query.$page = filter.$page ?? 1;
    query.$perPage = filter.$perPage ?? 20;

    const result = await this.mediator.execute<SearchCreditTransactionsQuery, IPageable<CreditTransactionDocument>>(query);

    return {
      ...result,
      items: result.items.map((item) => ({
        id: item.id,
        customerId: item.customerId,
        customerName: item.customerName,
        billId: item.billId,
        billNumber: item.billNumber,
        walkInName: item.walkInName,
        type: item.type,
        amount: item.amount,
        balanceBefore: item.balanceBefore,
        balanceAfter: item.balanceAfter,
        paymentMethod: item.paymentMethod,
        note: item.note,
        subtotal: item.subtotal,
        discountAmount: item.discountAmount,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount,
        billedAt: item.billedAt,
        createdAt: item.createdAt,
      })),
    };
  }
}
