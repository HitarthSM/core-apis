import { Injectable } from '@nestjs/common';
import { IFilterNormalizer, Filter, PageableFilter } from '../../../../common';
import { ReportGenerationLogFilter } from '../domain';
import { ReportGenerationLogFeatureOptions } from '../options';

@Injectable()
export class ReportGenerationLogFilterNormalizer implements IFilterNormalizer<ReportGenerationLogFilter> {
  constructor(public options: ReportGenerationLogFeatureOptions) {}

  public normalize(filter: Filter<ReportGenerationLogFilter>): Filter<ReportGenerationLogFilter> {
    this.applySearchAlias(filter);
    filter.$orderBy = filter.$orderBy ?? this.options.orderBy;
    filter.$order = filter.$order ?? this.options.order;
    return filter;
  }

  public pageableNormalize(filter: PageableFilter<ReportGenerationLogFilter>): PageableFilter<ReportGenerationLogFilter> {
    filter = this.normalize(filter);
    filter.$page = filter.$page ?? this.options.page;
    filter.$perPage = filter.$perPage ?? this.options.perPage;
    return filter;
  }

  /** Accept legacy `name` query param from generic client search helpers. */
  private applySearchAlias(filter: Filter<ReportGenerationLogFilter>): void {
    const raw = filter as Filter<ReportGenerationLogFilter> & { name?: string };
    if (raw.name && !raw.reportName) {
      raw.reportName = raw.name;
    }
    delete raw.name;
  }
}
