import { IBaseRepo, Filter, PageableFilter } from '../../../common';
import { Bill, BillFilter } from './domain';

export const BILL_REPO = 'BILL_REPO';

export interface IBillRepo extends IBaseRepo<Bill, string, PageableFilter<BillFilter>, Filter<BillFilter>> {
  countForDateAsync(date: Date): Promise<number>;
  findBySourceOrderIdAsync(orderId: string): Promise<Bill | null>;
}
