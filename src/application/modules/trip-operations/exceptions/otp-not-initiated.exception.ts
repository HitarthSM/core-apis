import { RpcBadRequestException } from '../../../../common';

export class OtpNotInitiatedException extends RpcBadRequestException {
  constructor() {
    super('OTP not initiated for this stop', 'OTP Not Initiated');
  }
}
