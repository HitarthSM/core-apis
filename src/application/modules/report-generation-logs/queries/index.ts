export * from './list-report-logs';
export * from './get-report-log';
export * from './search-report-logs';
export * from './download-report-pdf';

import { ListReportLogsQueryHandler } from './list-report-logs/list-report-logs.query-handler';
import { GetReportLogQueryHandler } from './get-report-log/get-report-log.query-handler';
import { SearchReportLogsQueryHandler } from './search-report-logs/search-report-logs.query-handler';
import { DownloadReportPdfQueryHandler } from './download-report-pdf/download-report-pdf.query-handler';

export const ReportLogQueryHandlers = [
  ListReportLogsQueryHandler,
  GetReportLogQueryHandler,
  SearchReportLogsQueryHandler,
  DownloadReportPdfQueryHandler,
];
