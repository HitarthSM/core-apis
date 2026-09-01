import { Inject } from '@nestjs/common';
import type { IQueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { QueryHandlerStrict, PDF_EXPORT_SERVICE, IPdfExportService, PdfDocument } from '../../../../../common';
import { PRODUCT_REPO, PURCHASE_ITEM_REPO, PURCHASE_ORDER_REPO, SUPPLIER_REPO } from '../../../../constants';
import type { IPurchaseOrderRepo } from '../../i-purchaseorder.repo';
import type { IPurchaseItemRepo } from '../../../purchase-items/i-purchase-item.repo';
import type { ISupplierRepo } from '../../../suppliers/i-supplier.repo';
import type { IProductRepo } from '../../../products/i-product.repo';
import { PurchaseOrder } from '../../domain';
import { PurchaseItem } from '../../../purchase-items/domain';
import { Product } from '../../../products/domain';
import { Supplier } from '../../../suppliers/domain';
import { ExportPurchaseOrderQuery } from './export-purchaseorder.query';

@QueryHandlerStrict(ExportPurchaseOrderQuery)
export class ExportPurchaseOrderQueryHandler implements IQueryHandler<ExportPurchaseOrderQuery, PdfDocument> {
  constructor(
    @Inject(PURCHASE_ORDER_REPO) private readonly poRepo: IPurchaseOrderRepo,
    @Inject(PURCHASE_ITEM_REPO) private readonly itemRepo: IPurchaseItemRepo,
    @Inject(SUPPLIER_REPO)      private readonly supplierRepo: ISupplierRepo,
    @Inject(PRODUCT_REPO)       private readonly productRepo: IProductRepo,
    @Inject(PDF_EXPORT_SERVICE) private readonly pdfService: IPdfExportService,
    @InjectPinoLogger(ExportPurchaseOrderQueryHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(query: ExportPurchaseOrderQuery): Promise<PdfDocument> {
    this.logger.info(`Executing ${ExportPurchaseOrderQuery.name} id=${query.id}`);

    const po: PurchaseOrder       = await this.poRepo.getAsync(query.id);
    const items: PurchaseItem[]   = await this.itemRepo.allAsync({ purchaseOrderId: po.id });
    const supplier: Supplier | null = await this.supplierRepo.getAsync(po.supplierId).catch(() => null);

    const productMap = new Map<string, Product>();
    await Promise.all(
      items.map(async (item) => {
        if (!productMap.has(item.productId)) {
          const p = await this.productRepo.getAsync(item.productId).catch(() => null);
          if (p) productMap.set(item.productId, p);
        }
      }),
    );

    const context  = this.buildContext(po, items, supplier, productMap);
    const filename = `purchase-order-${po.poNumber}.pdf`;

    return this.pdfService.generateFromTemplateAsync('purchase-order', context, filename);
  }

  private buildContext(
    po: PurchaseOrder,
    items: PurchaseItem[],
    supplier: Supplier | null,
    productMap: Map<string, Product>,
  ): Record<string, unknown> {
    const fmt = (v: number) =>
      new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(v ?? 0);

    const fmtDate = (d?: Date | string | null) => {
      if (!d) return '';
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return {
      organizationName:    'Organization',
      organizationAddress: '',
      organizationEmail:   '',

      poNumber:   po.poNumber,
      status:     po.status ?? 'Draft',
      createdAt:  fmtDate(po.createdAt),
      expectedAt: po.expectedAt ? fmtDate(po.expectedAt) : null,
      receivedAt: po.receivedAt ? fmtDate(po.receivedAt) : null,
      createdBy:  po.createdById ?? '',

      supplierName:    supplier?.name ?? `Supplier (${po.supplierId.slice(0, 8)})`,
      supplierContact: supplier?.contactPerson ?? '',
      supplierPhone:   supplier?.phone ?? '',
      supplierEmail:   supplier?.email ?? '',
      supplierTaxId:   supplier?.taxId ?? '',

      itemCount:     items.length,
      multipleItems: items.length !== 1,

      items: items.map((item, idx) => {
        const product     = productMap.get(item.productId);
        const receiveProgress = item.quantityOrdered > 0
          ? Math.round((item.quantityReceived / item.quantityOrdered) * 100)
          : 0;

        let packInfo = '';
        if (product?.sku)     packInfo += `SKU: ${product.sku}`;
        if (item.packQuantity) packInfo += (packInfo ? ' · ' : '') + `Pack qty: ${item.packQuantity}`;

        return {
          index:             idx + 1,
          name:              product?.name ?? `Product (${item.productId.slice(0, 8)})`,
          sku:               product?.sku ?? '',
          packInfo,
          quantityOrdered:   item.quantityOrdered,
          quantityReceived:  item.quantityReceived,
          receiveProgress:   receiveProgress < 100 ? receiveProgress : null,
          unitCost:          fmt(item.unitCost),
          totalCost:         fmt(item.totalCost),
        };
      }),

      totalAmount: fmt(po.totalAmount),
      notes:       po.notes ?? '',
      generatedAt: fmtDate(new Date()),
    };
  }
}
