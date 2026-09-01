import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ReportGenerationLogEntity } from '../../../../infrastructure/persistence/entities';
import { ReportGenerationLog } from '../domain';
import { CreateReportLogRequest, SearchReportLogsRequest, ListReportLogsRequest, ReportGenerationLogResponse, UpdateReportLogRequest, GenerateReportRequest } from '../models';
import { CreateReportLogCommand, UpdateReportLogCommand, GenerateReportCommand } from '../commands';
import { SearchReportLogsQuery, ListReportLogsQuery } from '../queries';

@Injectable()
export class ReportGenerationLogProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) { super(mapper); }

  public get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, ReportGenerationLogEntity, ReportGenerationLog);
      createMap(mapper, ReportGenerationLog, ReportGenerationLogEntity);
      createMap(mapper, ReportGenerationLog, ReportGenerationLogResponse);

      createMap(mapper, CreateReportLogRequest, CreateReportLogCommand);
      createMap(mapper, UpdateReportLogRequest, UpdateReportLogCommand);
      createMap(mapper, GenerateReportRequest, GenerateReportCommand);
      createMap(mapper, SearchReportLogsRequest, SearchReportLogsQuery);
      createMap(mapper, ListReportLogsRequest, ListReportLogsQuery);
    };
  }
}
