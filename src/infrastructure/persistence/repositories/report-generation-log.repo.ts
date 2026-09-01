import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { BaseRepo, Filter, PageableFilter } from '../../../common';
import { ReportGenerationLogEntity } from '../entities';
import { ReportGenerationLog } from '../../../application/modules/report-generation-logs/domain';
import { IReportGenerationLogRepo, ReportGenerationLogFilter } from '../../../application/modules/report-generation-logs';

@Injectable()
export class ReportGenerationLogRepo extends BaseRepo<ReportGenerationLogEntity, ReportGenerationLog, string, PageableFilter<ReportGenerationLogFilter>, Filter<ReportGenerationLogFilter>> implements IReportGenerationLogRepo {
  constructor(
    @InjectRepository(ReportGenerationLogEntity) internalRepo: Repository<ReportGenerationLogEntity>,
    @InjectMapper() mapper: Mapper,
    @InjectPinoLogger(ReportGenerationLogRepo.name) logger: PinoLogger,
  ) {
    super(internalRepo, mapper, logger, ReportGenerationLogEntity, ReportGenerationLog);
  }

  public override get idColumnName(): keyof ReportGenerationLogEntity {
    return 'id';
  }

  public override get specialFilterFields(): (keyof PageableFilter<ReportGenerationLogFilter>)[] {
    return [...super.specialFilterFields, 'name'];
  }

  protected override modifyFindOption(
    findOpts: FindManyOptions<ReportGenerationLogEntity>,
    filterObj: Filter<ReportGenerationLogFilter> | PageableFilter<ReportGenerationLogFilter>,
  ): void {
    const where = findOpts.where as Record<string, unknown> | undefined;
    if (!where) return;

    // Exact match for categorical filters — avoids ILike partial-match surprises.
    for (const key of ['reportType', 'reportPeriod', 'status'] as const) {
      const value = filterObj[key];
      if (value !== undefined) {
        where[key] = value;
      }
    }

    if (filterObj.reportName) {
      where.reportName = ILike(`%${filterObj.reportName}%`);
    }
  }
}
