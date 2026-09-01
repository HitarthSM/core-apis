import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { ETripStatus } from '../../../../shared/enums/e-trip-status';

export class DriverTripResponse {
  @ApiProperty() @AutoMap() public id: string;
  @ApiProperty() @AutoMap() public tripNumber: string;
  @ApiProperty({ enum: ETripStatus }) @AutoMap(() => String) public tripStatus: ETripStatus;
  @ApiProperty() @AutoMap() public startDatetime: Date;
  @ApiProperty() @AutoMap() public stopCount: number;
}
