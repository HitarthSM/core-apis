import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { EReportPeriod } from '../../domain/e-report-period';
import { EReportType } from '../../domain/e-report-type';

export class ReportGenerationLogResponse {
  @AutoMap() @ApiProperty() public id: string;
  @AutoMap() @ApiProperty() public orgId: string;
  @AutoMap(() => String) @ApiProperty({ enum: EReportType }) public reportType: EReportType;
  @AutoMap(() => String) @ApiProperty({ enum: EReportPeriod }) public reportPeriod: EReportPeriod;
  @AutoMap() @ApiProperty() public reportName: string;
  @AutoMap(() => Date) @ApiProperty() public fromDate: Date;
  @AutoMap(() => Date) @ApiProperty() public toDate: Date;
  @AutoMap() @ApiProperty({ required: false }) public locationId?: string;
  @AutoMap() @ApiProperty({ required: false }) public generatedById?: string;
  @AutoMap() @ApiProperty() public status: string;
  @AutoMap() @ApiProperty({ required: false }) public fileUrl?: string;
  @AutoMap() @ApiProperty({ required: false }) public errorMessage?: string;
  @AutoMap(() => Date) @ApiProperty() public createdAt: Date;
}

export class ReportGenerationLogsPagedResponse {
  @ApiProperty({ type: [ReportGenerationLogResponse] }) public items: ReportGenerationLogResponse[];
  @ApiProperty() public page: number;
  @ApiProperty() public perPage: number;
  @ApiProperty() public totalCount: number;
  @ApiProperty() public totalPages: number;
}
