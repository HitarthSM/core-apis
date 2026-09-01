import { IBaseRepo, Filter, PageableFilter } from '../../../common';
import { Order } from './domain';

export type OrderFilter = Record<string, never>;

export interface IOrderRepo extends IBaseRepo<Order, string, PageableFilter<OrderFilter>, Filter<OrderFilter>> {
  claimAsync(orderId: string, pickerUserId: string): Promise<Order>;
  findQueueAsync(locationId: string): Promise<Order[]>;
}
