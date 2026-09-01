import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class UpdateDriverLocationRequest {
  @ApiProperty() @IsNotEmpty() @IsUUID() @AutoMap() public driverId: string;
  @ApiProperty() @IsNotEmpty() @IsNumber() @AutoMap() public latitude: number;
  @ApiProperty() @IsNotEmpty() @IsNumber() @AutoMap() public longitude: number;
  @ApiProperty() @IsNotEmpty() @IsNumber() @AutoMap() public accuracy: number;
}
