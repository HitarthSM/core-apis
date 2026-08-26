import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommandHandlerStrict, ResourceNotOwnedByOrgException } from '../../../../../common';
import { CREDIT_APPROVAL_REQUEST_REPO } from '../../../../constants';
import { ECreditApprovalStatus } from '../../../../../infrastructure/persistence/entities/credit-approval-request.entity';
import { BillCompletionService } from '../../../../shared/services/bill-completion.service';
import { CreditApprovalRequest } from '../../domain';
import { ICreditApprovalRequestRepo } from '../../i-credit-approval-request.repo';
import { ApproveCreditApprovalCommand } from './approve-credit-approval.command';

@CommandHandlerStrict(ApproveCreditApprovalCommand)
export class ApproveCreditApprovalCommandHandler
  implements ICommandHandler<ApproveCreditApprovalCommand, CreditApprovalRequest>
{
  constructor(
    @Inject(CREDIT_APPROVAL_REQUEST_REPO) private readonly repo: ICreditApprovalRequestRepo,
    private readonly completionService: BillCompletionService,
    @InjectPinoLogger(ApproveCreditApprovalCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: ApproveCreditApprovalCommand): Promise<CreditApprovalRequest> {
    this.logger.info(`Executing ${ApproveCreditApprovalCommand.name} id=${command.id}`);
    const request = await this.repo.getAsync(command.id);
    if (!request) throw new NotFoundException(`CreditApprovalRequest ${command.id} not found`);
    if (request.organizationId !== command.organizationId) {
      throw new ResourceNotOwnedByOrgException('credit-approval-request');
    }
    if (request.status !== ECreditApprovalStatus.Pending) {
      throw new BadRequestException(`Credit approval is already ${request.status}`);
    }

    await this.completionService.completeBill(request.billId, command.decidedById, true);

    request.status = ECreditApprovalStatus.Approved;
    request.decidedById = command.decidedById;
    request.decidedAt = new Date();
    return this.repo.updateAsync(request);
  }
}
