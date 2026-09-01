import { Inject } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CommandHandlerStrict } from '../../../../../common';
import { TRIP_STOP_REPO } from '../../../../../application/constants';
import { ITripStopRepo } from '../../repositories/i-trip-stop.repo';
import { TripOperationsMailService } from '../../mail/trip-operations-mail.service';
import {
  TripStopNotFoundException,
  OtpCooldownException,
  CustomerEmailUnavailableException,
} from '../../exceptions';
import { InitiateDeliveryOtpCommand, InitiateDeliveryOtpResult } from './initiate-delivery-otp.command';

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 590;
const BCRYPT_ROUNDS = 10;

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***.***';
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

@CommandHandlerStrict(InitiateDeliveryOtpCommand)
export class InitiateDeliveryOtpCommandHandler
  implements ICommandHandler<InitiateDeliveryOtpCommand, InitiateDeliveryOtpResult> {
  public constructor(
    @Inject(TRIP_STOP_REPO) private readonly stopRepo: ITripStopRepo,
    private readonly mailService: TripOperationsMailService,
    @InjectPinoLogger(InitiateDeliveryOtpCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: InitiateDeliveryOtpCommand): Promise<InitiateDeliveryOtpResult> {
    this.logger.info(`Executing Command '${InitiateDeliveryOtpCommand.name}' stopId=${command.stopId}`);

    const stop = await this.stopRepo.findByTripAndStopAsync(command.tripId, command.stopId);
    if (!stop) throw new TripStopNotFoundException();

    if (stop.otpExpiresAt) {
      const sentAt = new Date(stop.otpExpiresAt.getTime() - OTP_EXPIRY_MINUTES * 60 * 1000);
      const elapsedSeconds = (Date.now() - sentAt.getTime()) / 1000;
      if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
        throw new OtpCooldownException();
      }
    }

    const customerEmail = await this.stopRepo.findCustomerEmailAsync(command.tripId, command.stopId);
    if (!customerEmail) {
      throw new CustomerEmailUnavailableException();
    }

    const otp = crypto.randomInt(100000, 999999).toString().padStart(6, '0');
    const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.stopRepo.updateOtpAsync(stop.id, otpHash, otpExpiresAt);

    await this.mailService
      .sendDeliveryOtpAsync(customerEmail, otp, OTP_EXPIRY_MINUTES)
      .catch((err: Error) =>
        this.logger.warn({ error: err.message }, 'OTP email send failed — non-fatal'),
      );

    return { maskedEmail: maskEmail(customerEmail) };
  }
}
