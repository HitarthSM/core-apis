import { Inject } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { REPORT_GENERATION_LOG_REPO, IReportGenerationLogRepo } from '../../i-report-generation-log.repo';
import { EReportType, ReportGenerationLog } from '../../domain';
import { CreateReportLogCommand } from './create-report-log.command';

@CommandHandler(CreateReportLogCommand)
export class CreateReportLogCommandHandler implements ICommandHandler<CreateReportLogCommand, ReportGenerationLog> {
  constructor(
    @Inject(REPORT_GENERATION_LOG_REPO) protected readonly repo: IReportGenerationLogRepo,
    @InjectPinoLogger(CreateReportLogCommandHandler.name) protected readonly logger: PinoLogger,
  ) {}

  public async execute(command: CreateReportLogCommand): Promise<ReportGenerationLog> {
    this.logger.info(`Executing Command "${CreateReportLogCommand.name}"`);
    const log = new ReportGenerationLog();
    log.orgId = command.orgId;
    log.reportType = command.reportType as EReportType;
    log.status = command.status || 'PENDING';
    return this.repo.createAsync(log);
  }
}
