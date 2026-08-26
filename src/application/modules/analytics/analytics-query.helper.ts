import { AuthenticatedUser } from '../../../common';
import { resolveAnalyticsLocationId } from './analytics-scope.util';
import {
  type AnalyticsPeriodPreset,
  resolveAnalyticsPeriod,
  resolveMonthsRange,
} from './analytics-period.util';

export interface AnalyticsQueryContext {
  organizationId: string;
  locationId?: string;
  from: Date;
  to: Date;
  trunc: 'hour' | 'day' | 'month';
  preset: AnalyticsPeriodPreset;
}

export function buildAnalyticsQueryContext(
  user: AuthenticatedUser,
  query: { period?: string; from?: string; to?: string; locationId?: string; months?: number },
): AnalyticsQueryContext {
  const organizationId = user.organizationId!;
  const locationId = resolveAnalyticsLocationId(user, query.locationId);

  if (query.period || query.from || query.to) {
    const resolved = resolveAnalyticsPeriod({
      period: query.period,
      from: query.from,
      to: query.to,
    });
    return {
      organizationId,
      locationId,
      from: resolved.from,
      to: resolved.to,
      trunc: resolved.trunc,
      preset: resolved.preset,
    };
  }

  const months = query.months ?? 6;
  const legacy = resolveMonthsRange(months);
  return {
    organizationId,
    locationId,
    from: legacy.from,
    to: legacy.to,
    trunc: legacy.trunc,
    preset: 'month',
  };
}
