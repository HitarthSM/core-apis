import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TripStopInputRequest {
  @ApiProperty() @IsNotEmpty() @IsUUID() @AutoMap() public orderId: string;
  @ApiProperty() @IsNotEmpty() @IsInt() @AutoMap() public sequence: number;
}

export class CreateMultiStopTripRequest {
  @ApiProperty() @IsNotEmpty() @IsUUID() @AutoMap() public driverId: string;
  @ApiProperty() @IsNotEmpty() @IsUUID() @AutoMap() public vehicleId: string;
  @ApiProperty({ type: [TripStopInputRequest] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TripStopInputRequest)
  @AutoMap()
  public stops: TripStopInputRequest[];
}
