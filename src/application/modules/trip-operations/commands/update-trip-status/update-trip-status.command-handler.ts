import { Inject } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommandHandlerStrict } from '../../../../../common';
import { TRIP_REPO } from '../../../../../application/constants';
import { ITripRepo } from '../../../trips/repositories/i-trip.repo';
import { Trip } from '../../../trips/domain';
import { TripNotFoundException } from '../../exceptions';
import { UpdateTripStatusCommand } from './update-trip-status.command';

@CommandHandlerStrict(UpdateTripStatusCommand)
export class UpdateTripStatusCommandHandler implements ICommandHandler<UpdateTripStatusCommand, Trip> {
  public constructor(
    @Inject(TRIP_REPO) private readonly tripRepo: ITripRepo,
    @InjectPinoLogger(UpdateTripStatusCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: UpdateTripStatusCommand): Promise<Trip> {
    this.logger.info(
      `Executing Command '${UpdateTripStatusCommand.name}' tripId=${command.tripId} status=${command.status}`,
    );

    const trip = await this.tripRepo.getAsync(command.tripId);
    if (!trip) throw new TripNotFoundException();
    trip.tripStatus = command.status;
    return this.tripRepo.updateAsync(trip);
  }
}
