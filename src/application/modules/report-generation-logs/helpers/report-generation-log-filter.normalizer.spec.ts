jest.mock('../../../../common', () => ({
  EOrder: { Asc: 'ASC', Desc: 'DESC' },
}));

import { EOrder } from '../../../../common/filtering/e-order';
import { ReportGenerationLogFilterNormalizer } from './report-generation-log-filter.normalizer';

describe('ReportGenerationLogFilterNormalizer', () => {
  const normalizer = new ReportGenerationLogFilterNormalizer({
    page: 1,
    perPage: 20,
    orderBy: 'createdAt',
    order: EOrder.Desc,
  });

  it('defaults sort to createdAt desc', () => {
    const result = normalizer.pageableNormalize({});
    expect(result.$orderBy).toBe('createdAt');
    expect(result.$order).toBe(EOrder.Desc);
    expect(result.$page).toBe(1);
    expect(result.$perPage).toBe(20);
  });

  it('maps generic client name param to reportName', () => {
    const result = normalizer.normalize({ name: 'Total Sales' });
    expect(result.reportName).toBe('Total Sales');
    expect(result.name).toBeUndefined();
  });

  it('prefers explicit reportName over name alias', () => {
    const result = normalizer.normalize({ name: 'ignored', reportName: 'Cash Sales' });
    expect(result.reportName).toBe('Cash Sales');
    expect(result.name).toBeUndefined();
  });

  it('preserves categorical filters unchanged', () => {
    const result = normalizer.normalize({
      reportType: 'total_sales',
      reportPeriod: 'DAILY',
      status: 'COMPLETED',
    });
    expect(result.reportType).toBe('total_sales');
    expect(result.reportPeriod).toBe('DAILY');
    expect(result.status).toBe('COMPLETED');
  });
});
