import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class CreatePurchaseOrderItemRequest {
  @ApiProperty() @IsNotEmpty() @IsUUID() public productId: string;
  @ApiProperty() @IsNotEmpty() @IsNumber() @Min(0.0001) public quantityOrdered: number;
  @ApiProperty() @IsNotEmpty() @IsNumber() @Min(0) public unitCost: number;
}

export class CreatePurchaseOrderRequest {
  @ApiProperty() @IsNotEmpty() @IsUUID() @AutoMap() public supplierId: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() @AutoMap() public expectedAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @AutoMap() public notes?: string;

  @ApiProperty({ type: [CreatePurchaseOrderItemRequest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemRequest)
  public items: CreatePurchaseOrderItemRequest[];
}
