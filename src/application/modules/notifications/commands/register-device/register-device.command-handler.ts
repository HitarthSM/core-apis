import { Inject } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommandHandlerStrict } from '../../../../../common';
import { USER_DEVICE_TOKEN_REPO } from '../../../../../application/constants';
import { IUserDeviceTokenRepo } from '../../repositories/i-user-device-token.repo';
import { RegisterDeviceCommand } from './register-device.command';

@CommandHandlerStrict(RegisterDeviceCommand)
export class RegisterDeviceCommandHandler implements ICommandHandler<RegisterDeviceCommand, boolean> {
  public constructor(
    @Inject(USER_DEVICE_TOKEN_REPO) private readonly deviceTokenRepo: IUserDeviceTokenRepo,
    @InjectPinoLogger(RegisterDeviceCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: RegisterDeviceCommand): Promise<boolean> {
    this.logger.info(`Executing Command '${RegisterDeviceCommand.name}' userId=${command.userId}`);
    await this.deviceTokenRepo.upsertAsync(command.userId, command.token, command.platform);
    return true;
  }
}
