import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TripOperationsController } from './trip-operations.controller';
import { TripOperationCommandHandlers } from './commands';
import { TripOperationQueryHandlers } from './queries';
import { TripOperationsMailService } from './mail/trip-operations-mail.service';
import { TripStopMapperProfile } from './mapper/trip-stop.mapper-profile';
import { MailOptions } from '../../../common';
import { ICoreApiConfig } from '../../../configuration';

@Module({
  imports: [CqrsModule],
  controllers: [TripOperationsController],
  providers: [
    {
      provide: MailOptions,
      useFactory: (config: ConfigService<ICoreApiConfig>): MailOptions => {
        const cfg = config.get<ICoreApiConfig['mail']>('mail');
        return new MailOptions(cfg.host, cfg.port, cfg.secure, cfg.user, cfg.password, cfg.from);
      },
      inject: [ConfigService],
    },
    TripOperationsMailService,
    TripStopMapperProfile,
    ...TripOperationCommandHandlers,
    ...TripOperationQueryHandlers,
  ],
})
export class TripOperationsModule {}
