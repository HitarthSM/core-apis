import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

export class FleetLiveLocationResponse {
  @ApiProperty() @AutoMap() public tripId: string;
  @ApiProperty() @AutoMap() public driverId: string;
  @ApiProperty() @AutoMap() public vehicleId: string;
  @ApiProperty() @AutoMap() public latitude: number;
  @ApiProperty() @AutoMap() public longitude: number;
  @ApiProperty() @AutoMap() public gpsTime: Date;
}
