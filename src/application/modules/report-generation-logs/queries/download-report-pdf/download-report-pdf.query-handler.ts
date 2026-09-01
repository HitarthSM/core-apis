import { Inject, NotFoundException } from '@nestjs/common';
import type { IQueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { DataSource } from 'typeorm';
import { QueryHandlerStrict, PDF_EXPORT_SERVICE, IPdfExportService, PdfDocument } from '../../../../../common';
import { REPORT_GENERATION_LOG_REPO, IReportGenerationLogRepo } from '../../i-report-generation-log.repo';
import { DownloadReportPdfQuery } from './download-report-pdf.query';

@QueryHandlerStrict(DownloadReportPdfQuery)
export class DownloadReportPdfQueryHandler implements IQueryHandler<DownloadReportPdfQuery, PdfDocument> {
  constructor(
    @Inject(REPORT_GENERATION_LOG_REPO) private readonly repo: IReportGenerationLogRepo,
    @Inject(PDF_EXPORT_SERVICE) private readonly pdfService: IPdfExportService,
    @Inject(DataSource) private readonly dataSource: DataSource,
    @InjectPinoLogger(DownloadReportPdfQueryHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(query: DownloadReportPdfQuery): Promise<PdfDocument> {
    this.logger.info(`Executing Query "${DownloadReportPdfQuery.name}"`);

    const log = await this.repo.getAsync(query.id);
    if (!log) throw new NotFoundException(`Report log ${query.id} not found`);
    if (log.status !== 'COMPLETED') {
      throw new NotFoundException(`Report ${query.id} is not completed`);
    }

    // AutoMapper may not map reportData if @AutoMap() was missing on older deployments.
    // Fall back to a direct raw read from the DB to guarantee we get the JSONB value.
    let reportData = log.reportData;
    if (!reportData) {
      const rows = await this.dataSource.query(
        `SELECT report_data FROM core.report_generation_logs WHERE id = $1`,
        [query.id],
      );
      reportData = rows[0]?.report_data ?? undefined;
    }

    if (!reportData) {
      throw new NotFoundException(`Report ${query.id} has no data — please regenerate it`);
    }

    const filename = `report-${log.reportName?.replace(/[^a-z0-9]/gi, '-').toLowerCase() ?? log.id}.pdf`;
    return this.pdfService.generateFromTemplateAsync('report', reportData, filename);
  }
}
