import { RpcBadRequestException } from '../../../../common';

export class OtpExpiredException extends RpcBadRequestException {
  constructor() {
    super('OTP has expired', 'OTP Expired');
  }
}
