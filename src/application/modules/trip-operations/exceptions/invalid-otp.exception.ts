import { RpcBadRequestException } from '../../../../common';

export class InvalidOtpException extends RpcBadRequestException {
  constructor() {
    super('Invalid OTP', 'Invalid OTP');
  }
}
