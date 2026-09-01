import { RpcBadRequestException } from '../../../../common';

export class OtpCooldownException extends RpcBadRequestException {
  constructor() {
    super('OTP was recently sent. Please wait before requesting again', 'OTP Cooldown');
  }
}
