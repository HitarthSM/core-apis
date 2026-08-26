import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreatePurchaseItemRequest {
  @ApiProperty() @IsNotEmpty() @IsUUID() @AutoMap() public purchaseOrderId: string;
  @ApiProperty() @IsNotEmpty() @IsUUID() @AutoMap() public productId: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @AutoMap() public quantityOrdered?: number;
  @ApiProperty() @IsNotEmpty() @IsNumber() @AutoMap() public unitCost: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @AutoMap() public packQuantity?: number;
}
