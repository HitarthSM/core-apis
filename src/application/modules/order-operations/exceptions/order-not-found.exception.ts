import { RpcNotFoundException } from '../../../../common';

export class OrderNotFoundException extends RpcNotFoundException {
  constructor() {
    super('Order not found', 'Order Not Found');
  }
}
