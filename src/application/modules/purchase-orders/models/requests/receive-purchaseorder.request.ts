import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class ReceivePurchaseOrderItemRequest {
  @ApiProperty() @IsNotEmpty() @IsUUID() public purchaseItemId: string;
  @ApiProperty() @IsNotEmpty() @IsNumber() @Min(0.0001) public quantityReceived: number;
}

export class ReceivePurchaseOrderRequest {
  @ApiProperty({ type: [ReceivePurchaseOrderItemRequest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceivePurchaseOrderItemRequest)
  public items: ReceivePurchaseOrderItemRequest[];

  @ApiPropertyOptional() @IsOptional() @IsString() public notes?: string;
}
