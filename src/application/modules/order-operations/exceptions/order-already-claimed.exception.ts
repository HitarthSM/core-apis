import { RpcConflictException } from '../../../../common';

export class OrderAlreadyClaimedException extends RpcConflictException {
  constructor() {
    super('Order already claimed or not in confirmed state', 'Order Already Claimed');
  }
}
