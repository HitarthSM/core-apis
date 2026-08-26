import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SharedModule } from '../../shared';
import { CreditApprovalsController } from './credit-approvals.controller';
import { CreditTransactionsController } from './credit-transactions.controller';
import { CreditApprovalCommandHandlers } from './commands';
import { CreditApprovalQueryHandlers } from './queries';
import { CreditApprovalProfile } from './mapper';

@Module({
  imports: [CqrsModule, SharedModule],
  controllers: [CreditApprovalsController, CreditTransactionsController],
  providers: [...CreditApprovalCommandHandlers, ...CreditApprovalQueryHandlers, CreditApprovalProfile],
})
export class CreditApprovalsModule {}
