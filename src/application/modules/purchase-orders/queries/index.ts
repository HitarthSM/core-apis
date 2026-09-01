// Standard barrel file
export * from './get-purchaseorder';
export * from './list-purchase-orders';
export * from './search-purchase-orders';
export * from './export-purchaseorder';

import { GetPurchaseOrderQueryHandler } from './get-purchaseorder';
import { ListPurchaseOrdersQueryHandler } from './list-purchase-orders';
import { SearchPurchaseOrdersQueryHandler } from './search-purchase-orders';
import { ExportPurchaseOrderQueryHandler } from './export-purchaseorder';

export const PurchaseOrderQueryHandlers = [
  GetPurchaseOrderQueryHandler,
  ListPurchaseOrdersQueryHandler,
  SearchPurchaseOrdersQueryHandler,
  ExportPurchaseOrderQueryHandler,
];
