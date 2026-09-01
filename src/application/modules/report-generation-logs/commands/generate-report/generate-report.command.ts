import { AutoMap } from '@automapper/classes';
import { CommandBase } from '../../../../../common';
import { EReportPeriod } from '../../domain/e-report-period';
import { EReportType } from '../../domain/e-report-type';

export class GenerateReportCommand extends CommandBase {
  @AutoMap(() => String) public reportType: EReportType;
  @AutoMap(() => String) public reportPeriod: EReportPeriod;
  @AutoMap() public fromDate: string;
  @AutoMap() public toDate: string;
  @AutoMap() public orgId: string;
  @AutoMap() public generatedById: string;
  @AutoMap() public locationId?: string;
}
