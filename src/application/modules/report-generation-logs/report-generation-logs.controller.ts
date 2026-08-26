import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AuthenticatedUser, ClerkAuthGuard, CqrsMediator, CurrentUser, RolesGuard, Roles, assertOrgOwnership, requireOrganizationId } from '../../../common';
import { IPageable, PdfDocument } from '../../../common';
import { ERole } from '../../../infrastructure';
import { CreateReportLogCommand, DeleteReportLogCommand, UpdateReportLogCommand, GenerateReportCommand } from './commands';
import { ReportGenerationLog } from './domain';
import {
  CreateReportLogRequest, SearchReportLogsRequest, ListReportLogsRequest,
  ReportGenerationLogResponse, ReportGenerationLogsPagedResponse,
  UpdateReportLogRequest, GenerateReportRequest,
} from './models';
import { GetReportLogQuery, ListReportLogsQuery, SearchReportLogsQuery, DownloadReportPdfQuery } from './queries';

@ApiBearerAuth()
@ApiTags('Report Generation Logs')
@UseGuards(ClerkAuthGuard)
@Controller({ path: 'report-generation-logs', version: '1' })
export class ReportGenerationLogsController {
  constructor(
    protected readonly mediator: CqrsMediator,
    @InjectMapper() protected readonly mapper: Mapper,
    @InjectPinoLogger(ReportGenerationLogsController.name) protected readonly logger: PinoLogger,
  ) {}

  @ApiOperation({ summary: 'Search report logs (paginated)' })
  @ApiOkResponse({ type: ReportGenerationLogsPagedResponse })
  @HttpCode(HttpStatus.OK)
  @Get()
  public async search(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filter?: SearchReportLogsRequest,
  ): Promise<ReportGenerationLogsPagedResponse> {
    const query  = this.mapper.map(filter, SearchReportLogsRequest, SearchReportLogsQuery);
    query.orgId  = requireOrganizationId(user);
    const result = await this.mediator.execute<SearchReportLogsQuery, IPageable<ReportGenerationLog>>(query);
    return {
      ...result,
      items: this.mapper.mapArray(result.items, ReportGenerationLog, ReportGenerationLogResponse),
    };
  }

  @ApiOperation({ summary: 'List all report logs' })
  @ApiOkResponse({ type: [ReportGenerationLogResponse] })
  @HttpCode(HttpStatus.OK)
  @Get('list')
  public async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filter?: ListReportLogsRequest,
  ): Promise<ReportGenerationLogResponse[]> {
    const query  = this.mapper.map(filter, ListReportLogsRequest, ListReportLogsQuery);
    query.orgId  = requireOrganizationId(user);
    const result = await this.mediator.execute<ListReportLogsQuery, ReportGenerationLog[]>(query);
    return this.mapper.mapArray(result, ReportGenerationLog, ReportGenerationLogResponse);
  }

  @ApiOperation({ summary: 'Generate a new report (aggregates data + stores log)' })
  @ApiCreatedResponse({ type: ReportGenerationLogResponse })
  @HttpCode(HttpStatus.CREATED)
  @Post('generate')
  public async generate(
    @Body() body: GenerateReportRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReportGenerationLogResponse> {
    const command         = this.mapper.map(body, GenerateReportRequest, GenerateReportCommand);
    command.orgId         = user.organizationId ?? '';
    command.generatedById = user.dbUserId ?? '';
    const result          = await this.mediator.execute<GenerateReportCommand, ReportGenerationLog>(command);
    return this.mapper.map(result, ReportGenerationLog, ReportGenerationLogResponse);
  }

  @ApiOperation({ summary: 'Download report as PDF' })
  @ApiParam({ name: 'id', description: 'Report Log UUID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id/pdf')
  public async downloadPdf(
    @Param('id') id: string,
    @Res() res: Response,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    const fetchQuery = new GetReportLogQuery();
    fetchQuery.id    = id;
    const log        = await this.mediator.execute<GetReportLogQuery, ReportGenerationLog>(fetchQuery);
    assertOrgOwnership(user, log.orgId, 'Report Generation Log');

    const dlQuery = new DownloadReportPdfQuery();
    dlQuery.id    = id;
    const doc: PdfDocument = await this.mediator.execute<DownloadReportPdfQuery, PdfDocument>(dlQuery);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${doc.filename}"`,
      'Content-Length': String(doc.buffer.byteLength),
    });
    res.end(doc.buffer);
  }

  @ApiOperation({ summary: 'Get report log by ID' })
  @ApiOkResponse({ type: ReportGenerationLogResponse })
  @ApiParam({ name: 'id', description: 'Report Log UUID' })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  public async getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReportGenerationLogResponse> {
    const query = new GetReportLogQuery();
    query.id    = id;
    const result = await this.mediator.execute<GetReportLogQuery, ReportGenerationLog>(query);
    assertOrgOwnership(user, result.orgId, 'Report Generation Log');
    return this.mapper.map(result, ReportGenerationLog, ReportGenerationLogResponse);
  }

  @ApiOperation({ summary: 'Create a new report log entry' })
  @ApiCreatedResponse({ type: ReportGenerationLogResponse })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  public async create(@Body() body: CreateReportLogRequest): Promise<ReportGenerationLogResponse> {
    const command = this.mapper.map(body, CreateReportLogRequest, CreateReportLogCommand);
    const result  = await this.mediator.execute<CreateReportLogCommand, ReportGenerationLog>(command);
    return this.mapper.map(result, ReportGenerationLog, ReportGenerationLogResponse);
  }

  @ApiOperation({ summary: 'Update a report log' })
  @ApiOkResponse({ type: ReportGenerationLogResponse })
  @ApiParam({ name: 'id', description: 'Report Log UUID' })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Body() body: UpdateReportLogRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReportGenerationLogResponse> {
    const fetchQuery = new GetReportLogQuery();
    fetchQuery.id    = id;
    const existing   = await this.mediator.execute<GetReportLogQuery, ReportGenerationLog>(fetchQuery);
    assertOrgOwnership(user, existing.orgId, 'Report Generation Log');
    const command    = this.mapper.map(body, UpdateReportLogRequest, UpdateReportLogCommand);
    command.id       = id;
    const result     = await this.mediator.execute<UpdateReportLogCommand, ReportGenerationLog>(command);
    return this.mapper.map(result, ReportGenerationLog, ReportGenerationLogResponse);
  }

  @ApiOperation({ summary: 'Delete a report log' })
  @ApiOkResponse({ type: Boolean })
  @ApiParam({ name: 'id', description: 'Report Log UUID' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(ERole.StoreManager, ERole.OrgManager, ERole.OrgAdmin, ERole.SuperAdmin)
  @Delete(':id')
  public async delete(@Param('id') id: string): Promise<boolean> {
    const command = new DeleteReportLogCommand();
    command.id    = id;
    return this.mediator.execute<DeleteReportLogCommand, boolean>(command);
  }
}
