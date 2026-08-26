import { IBaseRepo, Filter, PageableFilter } from '../../../common';
import { PurchaseItemAllocation } from './domain';

export interface PurchaseItemAllocationFilter {
  purchaseOrderId?: string;
  purchaseItemId?: string;
}

export const PURCHASE_ITEM_ALLOCATION_REPO = 'PURCHASE_ITEM_ALLOCATION_REPO';

export type IPurchaseItemAllocationRepo = IBaseRepo<
  PurchaseItemAllocation,
  string,
  PageableFilter<PurchaseItemAllocationFilter>,
  Filter<PurchaseItemAllocationFilter>
>;
