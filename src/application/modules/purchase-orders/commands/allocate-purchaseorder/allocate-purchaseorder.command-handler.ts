import { BadRequestException, Inject } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommandHandlerStrict } from '../../../../../common';
import {
  INVENTORY_REPO,
  PURCHASE_ITEM_ALLOCATION_REPO,
  PURCHASE_ITEM_REPO,
  PURCHASE_ORDER_REPO,
} from '../../../../constants';
import { PurchaseOrder, PurchaseItemAllocation } from '../../domain';
import { IPurchaseOrderRepo } from '../..';
import { IPurchaseItemRepo } from '../../../purchase-items/i-purchase-item.repo';
import { IInventoryRepo } from '../../../inventory/i-inventory.repo';
import { Inventory } from '../../../inventory/domain';
import { IPurchaseItemAllocationRepo } from '../../i-purchase-item-allocation.repo';
import { StockOrchestrationService } from 'src/application/shared';
import { EPurchaseOrderStatus } from 'src/application/shared/enums';
import { AllocatePurchaseOrderCommand } from './allocate-purchaseorder.command';

const ALLOWED_STATUSES: EPurchaseOrderStatus[] = [
  EPurchaseOrderStatus.PartiallyReceived,
  EPurchaseOrderStatus.Received,
  EPurchaseOrderStatus.PartiallyAllocated,
];

@CommandHandlerStrict(AllocatePurchaseOrderCommand)
export class AllocatePurchaseOrderCommandHandler implements ICommandHandler<AllocatePurchaseOrderCommand, PurchaseOrder> {
  constructor(
    @Inject(PURCHASE_ORDER_REPO) private readonly poRepo: IPurchaseOrderRepo,
    @Inject(PURCHASE_ITEM_REPO) private readonly itemRepo: IPurchaseItemRepo,
    @Inject(INVENTORY_REPO) private readonly inventoryRepo: IInventoryRepo,
    @Inject(PURCHASE_ITEM_ALLOCATION_REPO) private readonly allocationRepo: IPurchaseItemAllocationRepo,
    private readonly orchestrator: StockOrchestrationService,
    @InjectPinoLogger(AllocatePurchaseOrderCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: AllocatePurchaseOrderCommand): Promise<PurchaseOrder> {
    this.logger.info(`Executing ${AllocatePurchaseOrderCommand.name} poId=${command.purchaseOrderId}`);

    const po = await this.poRepo.getAsync(command.purchaseOrderId);

    if (!ALLOWED_STATUSES.includes(po.status)) {
      throw new BadRequestException(
        `Cannot allocate stock for a purchase order with status "${po.status}". Items must be received first.`,
      );
    }

    for (const alloc of command.allocations) {
      const item = await this.itemRepo.getAsync(alloc.purchaseItemId);

      const maxAllocatable = Number(item.quantityReceived ?? 0) - Number(item.quantityAllocated ?? 0);
      if (Number(alloc.quantity) > maxAllocatable) {
        throw new BadRequestException(
          `Cannot allocate ${alloc.quantity} units for item ${alloc.purchaseItemId}. ` +
          `Only ${maxAllocatable} units available (received: ${item.quantityReceived}, already allocated: ${item.quantityAllocated}).`,
        );
      }

      const existing = await this.inventoryRepo.allAsync({
        organizationId: command.organizationId,
        locationId:     alloc.locationId,
        productId:      item.productId,
      });

      let inv = existing[0];
      if (!inv) {
        const newInv          = new Inventory();
        newInv.organizationId = command.organizationId;
        newInv.locationId     = alloc.locationId;
        newInv.productId      = item.productId;
        newInv.quantityOnHand   = 0;
        newInv.quantityReserved = 0;
        newInv.reorderLevel     = 0;
        inv = await this.inventoryRepo.createAsync(newInv);
      }

      await this.orchestrator.addStock({
        inventoryId:   inv.id,
        organizationId: command.organizationId,
        locationId:    alloc.locationId,
        productId:     item.productId,
        quantity:      alloc.quantity,
        unitCost:      item.unitCost,
        referenceId:   command.purchaseOrderId,
        referenceType: 'purchase_order',
        performedById: command.performedById,
        notes:         command.notes,
      });

      const record              = new PurchaseItemAllocation();
      record.organizationId     = command.organizationId;
      record.purchaseOrderId    = command.purchaseOrderId;
      record.purchaseItemId     = alloc.purchaseItemId;
      record.locationId         = alloc.locationId;
      record.quantity           = alloc.quantity;
      record.performedById      = command.performedById;
      record.notes              = command.notes;
      await this.allocationRepo.createAsync(record);

      item.quantityAllocated = Number(item.quantityAllocated ?? 0) + Number(alloc.quantity);
      await this.itemRepo.updateAsync(item);
    }

    const allItems          = await this.itemRepo.allAsync({ purchaseOrderId: command.purchaseOrderId });
    const anyAllocated      = allItems.some(ii => Number(ii.quantityAllocated ?? 0) > 0);
    const allFullyAllocated = allItems.every(
      ii => Number(ii.quantityAllocated ?? 0) >= Number(ii.quantityReceived ?? 0) && Number(ii.quantityReceived ?? 0) > 0,
    );

    if (allFullyAllocated) {
      po.status = EPurchaseOrderStatus.Allocated;
    } else if (anyAllocated) {
      po.status = EPurchaseOrderStatus.PartiallyAllocated;
    }

    return this.poRepo.updateAsync(po);
  }
}
