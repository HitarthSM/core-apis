import { Inject } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommandHandlerStrict } from '../../../../../common';
import { IPushNotificationService, PUSH_NOTIFICATION_SERVICE } from '../../../../../common';
import { CentrifugalService } from '../../../../../common/centrifugal';
import { TRIP_REPO } from '../../../../../application/constants';
import { ITripRepo } from '../../../trips/repositories/i-trip.repo';
import { Trip } from '../../../trips/domain';
import { CreateMultiStopTripCommand } from './create-multi-stop-trip.command';

@CommandHandlerStrict(CreateMultiStopTripCommand)
export class CreateMultiStopTripCommandHandler implements ICommandHandler<CreateMultiStopTripCommand, Trip> {
  public constructor(
    @Inject(TRIP_REPO) private readonly tripRepo: ITripRepo,
    private readonly centrifugal: CentrifugalService,
    @Inject(PUSH_NOTIFICATION_SERVICE) private readonly pushService: IPushNotificationService,
    @InjectPinoLogger(CreateMultiStopTripCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: CreateMultiStopTripCommand): Promise<Trip> {
    this.logger.info(`Executing Command '${CreateMultiStopTripCommand.name}' driverId=${command.driverId}`);

    const trip = await this.tripRepo.createTripWithStopsAsync(
      command.driverId,
      command.vehicleId,
      command.stops,
    );

    await this.centrifugal
      .publish(`user_${command.driverId}`, {
        type: 'trip:assigned',
        tripId: trip.id,
        stopCount: command.stops.length,
      })
      .catch((err: Error) =>
        this.logger.warn({ error: err.message }, 'Centrifugo trip:assigned publish failed — non-fatal'),
      );

    await this.pushService
      .sendAsync({
        userId: command.driverId,
        organizationId: command.organizationId,
        type: 'trip:assigned',
        title: 'New Trip Assigned',
        body: `You have been assigned trip ${trip.tripNumber} with ${command.stops.length} stops`,
        data: { tripId: trip.id },
      })
      .catch((err: Error) =>
        this.logger.warn({ error: err.message }, 'Push send to driver failed — non-fatal'),
      );

    return trip;
  }
}
