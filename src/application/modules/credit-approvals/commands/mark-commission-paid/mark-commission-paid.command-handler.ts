import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommandHandlerStrict, ResourceNotOwnedByOrgException } from '../../../../../common';
import { COMMISSION_PAYABLE_REPO } from '../../../../constants';
import { ECommissionStatus } from '../../../../../infrastructure/persistence/entities/commission-payable.entity';
import { CommissionPayable } from '../../domain';
import { ICommissionPayableRepo } from '../../i-commission-payable.repo';
import { MarkCommissionPaidCommand } from './mark-commission-paid.command';

@CommandHandlerStrict(MarkCommissionPaidCommand)
export class MarkCommissionPaidCommandHandler
  implements ICommandHandler<MarkCommissionPaidCommand, CommissionPayable>
{
  constructor(
    @Inject(COMMISSION_PAYABLE_REPO) private readonly repo: ICommissionPayableRepo,
    @InjectPinoLogger(MarkCommissionPaidCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: MarkCommissionPaidCommand): Promise<CommissionPayable> {
    this.logger.info(`Executing ${MarkCommissionPaidCommand.name} id=${command.id}`);
    const row = await this.repo.getAsync(command.id);
    if (!row) throw new NotFoundException(`CommissionPayable ${command.id} not found`);
    if (row.organizationId !== command.organizationId) {
      throw new ResourceNotOwnedByOrgException('commission-payable');
    }
    if (row.status === ECommissionStatus.Paid) {
      throw new BadRequestException('Commission is already paid');
    }
    row.status = ECommissionStatus.Paid;
    row.paidAt = new Date();
    return this.repo.updateAsync(row);
  }
}
