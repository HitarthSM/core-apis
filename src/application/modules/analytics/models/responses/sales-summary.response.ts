import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SalesPeriodComparisonResponse, SalesProductHighlightResponse } from './sales-period-comparison.response';

export class SalesSummaryResponse {
  @ApiProperty()
  public revenueThisMonth: number;

  @ApiProperty()
  public revenueThisWeek: number;

  @ApiProperty()
  public avgBillValue: number;

  @ApiProperty()
  public activeCustomers: number;

  @ApiProperty()
  public completedBills: number;

  @ApiProperty()
  public pendingBills: number;

  @ApiProperty({ description: 'Total units sold on completed bills in the period' })
  public totalUnitsSold: number;

  @ApiPropertyOptional({ description: 'Label for comparison window, e.g. vs yesterday' })
  public comparisonLabel?: string;

  @ApiPropertyOptional({ type: SalesPeriodComparisonResponse })
  public previous?: SalesPeriodComparisonResponse;

  @ApiPropertyOptional({ type: SalesProductHighlightResponse })
  public topSelling?: SalesProductHighlightResponse;

  @ApiPropertyOptional({ type: SalesProductHighlightResponse })
  public topMargin?: SalesProductHighlightResponse;

  @ApiPropertyOptional({ type: SalesProductHighlightResponse })
  public topCostly?: SalesProductHighlightResponse;
}
