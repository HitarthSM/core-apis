import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { EReportPeriod } from '../../domain/e-report-period';
import { EReportType } from '../../domain/e-report-type';

export class GenerateReportRequest {
  @ApiProperty({ enum: EReportType }) @IsEnum(EReportType) @IsNotEmpty() @AutoMap(() => String) public reportType: EReportType;
  @ApiProperty({ enum: EReportPeriod }) @IsEnum(EReportPeriod) @IsNotEmpty() @AutoMap(() => String) public reportPeriod: EReportPeriod;
  @ApiProperty() @IsString() @IsNotEmpty() @AutoMap() public fromDate: string;
  @ApiProperty() @IsString() @IsNotEmpty() @AutoMap() public toDate: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() @AutoMap() public locationId?: string;
}

export class CreateReportLogRequest {
  @ApiProperty() @AutoMap() public orgId: string;
  @ApiProperty() @AutoMap() public reportType: string;
  @ApiProperty({ default: 'PENDING' }) @AutoMap() public status?: string;
}

export class UpdateReportLogRequest {
  @ApiProperty({ required: false }) @AutoMap() public status?: string;
  @ApiProperty({ required: false }) @AutoMap() public fileUrl?: string;
  @ApiProperty({ required: false }) @AutoMap() public errorMessage?: string;
}

export class SearchReportLogsRequest {
  @ApiProperty({ required: false }) @AutoMap() public orgId?: string;
  @ApiProperty({ required: false }) @AutoMap(() => String) public reportType?: string;
  @ApiProperty({ required: false }) @AutoMap(() => String) public reportPeriod?: string;
  @ApiProperty({ required: false }) @AutoMap() public status?: string;
  @ApiProperty({ required: false, default: 1 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @AutoMap() public $page?: number;
  @ApiProperty({ required: false, default: 20 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @AutoMap() public $perPage?: number;
}

export class ListReportLogsRequest {
  @ApiProperty({ required: false }) @AutoMap() public orgId?: string;
}
