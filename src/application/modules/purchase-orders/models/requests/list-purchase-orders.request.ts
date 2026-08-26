import { AutoMap } from '@automapper/classes';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EOrder, Filter } from '../../../../../common';
import { PurchaseOrderFilter } from '../../domain';
import { EPurchaseOrderStatus } from 'src/application/shared/enums';

export class ListPurchaseOrdersRequest implements Filter<PurchaseOrderFilter> {
  @ApiPropertyOptional() @IsOptional() @IsString() @AutoMap() public supplierId?: string;
  @ApiPropertyOptional({ enum: EPurchaseOrderStatus }) @IsOptional() @IsEnum(EPurchaseOrderStatus) @AutoMap(() => String) public status?: EPurchaseOrderStatus;

  @ApiPropertyOptional() @IsOptional() @IsString({ each: true }) @AutoMap(() => Array) public $ids?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @AutoMap() public $orderBy?: string;
  @ApiPropertyOptional({ enum: EOrder }) @IsOptional() @IsEnum(EOrder) @AutoMap(() => String) public $order?: EOrder;
}
