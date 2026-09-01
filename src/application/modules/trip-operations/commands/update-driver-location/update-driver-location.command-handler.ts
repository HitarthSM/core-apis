import { Inject } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommandHandlerStrict } from '../../../../../common';
import { CentrifugalService } from '../../../../../common/centrifugal';
import { TRIP_REPO, VEHICLE_LOCATION_REPO } from '../../../../../application/constants';
import { ITripRepo } from '../../../trips/repositories/i-trip.repo';
import { IVehicleLocationRepo } from '../../../trips/repositories/i-vehicle-location.repo';
import { TripNotFoundException } from '../../exceptions';
import { UpdateDriverLocationCommand } from './update-driver-location.command';

@CommandHandlerStrict(UpdateDriverLocationCommand)
export class UpdateDriverLocationCommandHandler implements ICommandHandler<UpdateDriverLocationCommand, void> {
  public constructor(
    @Inject(TRIP_REPO) private readonly tripRepo: ITripRepo,
    @Inject(VEHICLE_LOCATION_REPO) private readonly vehicleLocationRepo: IVehicleLocationRepo,
    private readonly centrifugal: CentrifugalService,
    @InjectPinoLogger(UpdateDriverLocationCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: UpdateDriverLocationCommand): Promise<void> {
    this.logger.info(`Executing Command '${UpdateDriverLocationCommand.name}' tripId=${command.tripId}`);

    const trip = await this.tripRepo.getAsync(command.tripId);
    if (!trip) throw new TripNotFoundException();
    await this.vehicleLocationRepo.upsertByVehicleIdAsync(
      trip.vehicleId,
      command.latitude,
      command.longitude,
      new Date(),
    );

    await this.centrifugal
      .publish(`org_${command.organizationId}`, {
        type: 'driver:location',
        driverId: command.driverId,
        tripId: command.tripId,
        latitude: command.latitude,
        longitude: command.longitude,
        timestamp: new Date(),
      })
      .catch((err: Error) =>
        this.logger.warn({ error: err.message }, 'Centrifugo driver:location publish failed — non-fatal'),
      );
  }
}
