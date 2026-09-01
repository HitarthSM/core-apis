import { AutoMap } from '@automapper/classes';

export class VehicleLocation {
  @AutoMap() public id: string;
  @AutoMap() public vehicleId: string;
  @AutoMap() public latitude: number;
  @AutoMap() public longitude: number;
  @AutoMap() public speed?: number;
  @AutoMap() public heading?: number;
  @AutoMap() public altitude?: number;
  @AutoMap() public fuelLevel?: number;
  @AutoMap() public odometer?: number;
  @AutoMap() public engineStatus?: string;
  @AutoMap(() => Date) public gpsTime: Date;
  @AutoMap(() => Date) public createdAt: Date;
}
