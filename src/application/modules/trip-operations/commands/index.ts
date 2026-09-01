export * from './create-multi-stop-trip/create-multi-stop-trip.command';
export * from './create-multi-stop-trip/create-multi-stop-trip.command-handler';
export * from './update-trip-status/update-trip-status.command';
export * from './update-trip-status/update-trip-status.command-handler';
export * from './update-driver-location/update-driver-location.command';
export * from './update-driver-location/update-driver-location.command-handler';
export * from './initiate-delivery-otp/initiate-delivery-otp.command';
export * from './initiate-delivery-otp/initiate-delivery-otp.command-handler';
export * from './confirm-delivery-otp/confirm-delivery-otp.command';
export * from './confirm-delivery-otp/confirm-delivery-otp.command-handler';
export * from './resend-delivery-otp/resend-delivery-otp.command';
export * from './resend-delivery-otp/resend-delivery-otp.command-handler';

import { CreateMultiStopTripCommandHandler } from './create-multi-stop-trip/create-multi-stop-trip.command-handler';
import { UpdateTripStatusCommandHandler } from './update-trip-status/update-trip-status.command-handler';
import { UpdateDriverLocationCommandHandler } from './update-driver-location/update-driver-location.command-handler';
import { InitiateDeliveryOtpCommandHandler } from './initiate-delivery-otp/initiate-delivery-otp.command-handler';
import { ConfirmDeliveryOtpCommandHandler } from './confirm-delivery-otp/confirm-delivery-otp.command-handler';
import { ResendDeliveryOtpCommandHandler } from './resend-delivery-otp/resend-delivery-otp.command-handler';

export const TripOperationCommandHandlers = [
  CreateMultiStopTripCommandHandler,
  UpdateTripStatusCommandHandler,
  UpdateDriverLocationCommandHandler,
  InitiateDeliveryOtpCommandHandler,
  ConfirmDeliveryOtpCommandHandler,
  ResendDeliveryOtpCommandHandler,
];
