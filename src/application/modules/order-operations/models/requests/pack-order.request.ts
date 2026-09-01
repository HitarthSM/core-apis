import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PackedItemRequest {
  @ApiProperty() @IsNotEmpty() @IsUUID() @AutoMap() public orderItemId: string;
  @ApiProperty() @IsNotEmpty() @IsNumber() @AutoMap() public packedQty: number;
}

export class PackOrderRequest {
  @ApiProperty() @IsNotEmpty() @IsUUID() @AutoMap() public packerUserId: string;
  @ApiProperty({ type: [PackedItemRequest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackedItemRequest)
  @AutoMap()
  public items: PackedItemRequest[];
}
