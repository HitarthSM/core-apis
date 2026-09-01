import { RpcBadRequestException } from '../../../../common';

export class OrderNotInConfirmedStatusException extends RpcBadRequestException {
  constructor() {
    super('Order must be in confirmed status to fulfill from store');
  }
}
