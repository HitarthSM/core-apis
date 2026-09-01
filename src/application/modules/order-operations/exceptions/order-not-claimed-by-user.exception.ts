import { RpcBadRequestException } from '../../../../common';

export class OrderNotClaimedByUserException extends RpcBadRequestException {
  constructor() {
    super('Order was not claimed by this user', 'Order Not Claimed By User');
  }
}
