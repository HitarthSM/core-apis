import { AutoMap } from '@automapper/classes';
import { EReportPeriod } from './e-report-period';
import { EReportType } from './e-report-type';

export class ReportGenerationLog {
  @AutoMap() public id: string;
  @AutoMap() public orgId: string;
  @AutoMap(() => String) public reportType: EReportType;
  @AutoMap(() => String) public reportPeriod: EReportPeriod;
  @AutoMap() public reportName: string;
  @AutoMap(() => Date) public fromDate: Date;
  @AutoMap(() => Date) public toDate: Date;
  @AutoMap() public locationId?: string;
  @AutoMap() public generatedById?: string;
  @AutoMap() public status: string;
  @AutoMap() public fileUrl?: string;
  @AutoMap() public errorMessage?: string;
  @AutoMap() public reportData?: Record<string, unknown>;
  @AutoMap(() => Date) public createdAt: Date;
}
