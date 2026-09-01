import { RpcNotFoundException } from '../../../../common';

export class TripStopNotFoundException extends RpcNotFoundException {
  constructor() {
    super('Trip stop not found', 'Trip Stop Not Found');
  }
}
