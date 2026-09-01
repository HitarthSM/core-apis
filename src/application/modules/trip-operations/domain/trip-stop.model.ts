import { AutoMap } from '@automapper/classes';
import { ETripStopStatus } from '../../../shared/enums/e-trip-stop-status';

export class TripStop {
  @AutoMap() public id: string;
  @AutoMap() public tripId: string;
  @AutoMap() public orderId: string;
  @AutoMap() public sequence: number;
  @AutoMap(() => String) public status: ETripStopStatus;
  @AutoMap() public otpCode?: string;
  @AutoMap(() => Date) public otpExpiresAt?: Date;
  @AutoMap(() => Date) public otpVerifiedAt?: Date;
  @AutoMap(() => Date) public deliveredAt?: Date;
  @AutoMap(() => Date) public createdAt: Date;
  @AutoMap(() => Date) public updatedAt?: Date;
}
