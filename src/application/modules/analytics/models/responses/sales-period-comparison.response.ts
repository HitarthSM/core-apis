import { ApiProperty } from '@nestjs/swagger';

export class SalesPeriodComparisonResponse {
  @ApiProperty()
  public completedBills: number;

  @ApiProperty()
  public activeCustomers: number;

  @ApiProperty()
  public totalUnitsSold: number;

  @ApiProperty()
  public revenue: number;

  @ApiProperty()
  public avgBillValue: number;
}

export class SalesProductHighlightResponse {
  @ApiProperty()
  public productId: string;

  @ApiProperty()
  public productName: string;

  @ApiProperty()
  public currentValue: number;

  @ApiProperty()
  public previousValue: number;
}
