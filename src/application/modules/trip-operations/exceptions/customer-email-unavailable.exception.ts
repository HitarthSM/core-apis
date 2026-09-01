import { RpcBadRequestException } from '../../../../common';

export class CustomerEmailUnavailableException extends RpcBadRequestException {
  constructor() {
    super('Customer email not available for OTP delivery', 'Customer Email Unavailable');
  }
}
