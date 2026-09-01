export interface ReportGenerationLogFilter {
  orgId?: string;
  reportType?: string;
  reportPeriod?: string;
  status?: string;
  reportName?: string;
  /** Generic client search alias — mapped to reportName by the filter normalizer. */
  name?: string;
}
