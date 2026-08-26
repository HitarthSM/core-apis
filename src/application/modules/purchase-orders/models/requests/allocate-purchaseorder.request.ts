import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class AllocationItemRequest {
  @ApiProperty({ description: 'Purchase item ID' })
  @IsNotEmpty()
  @IsUUID()
  public purchaseItemId: string;

  @ApiProperty({ description: 'Location to allocate stock to' })
  @IsNotEmpty()
  @IsUUID()
  public locationId: string;

  @ApiProperty({ description: 'Quantity to allocate to this location' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.0001)
  public quantity: number;
}

export class AllocatePurchaseOrderRequest {
  @ApiProperty({ type: [AllocationItemRequest], description: 'List of allocations — one entry per (item, location) pair' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllocationItemRequest)
  public allocations: AllocationItemRequest[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  public notes?: string;
}
