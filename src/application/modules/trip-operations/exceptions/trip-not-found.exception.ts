import { RpcNotFoundException } from '../../../../common';

export class TripNotFoundException extends RpcNotFoundException {
  constructor() {
    super('Trip not found', 'Trip Not Found');
  }
}
