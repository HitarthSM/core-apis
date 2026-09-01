# Purchase Order — Post-Location Allocation

## What Changed

The purchase order module moved from **pre-location** (location chosen at PO creation) to **post-location** (location chosen after stock is physically received). This enables splitting received stock across multiple locations per item.

## Old Flow

```
Create PO  →  (set locationId)  →  Receive goods  →  Stock added to that single location
```

## New Flow

```
Create PO  →  Receive goods (no stock added)  →  Allocate each item to locations  →  Stock added per location
```

## Status Progression

```
Draft → Ordered → PartiallyReceived → Received → PartiallyAllocated → Allocated
```

- **PartiallyReceived** — some items have `quantityReceived > 0` but not all fully received  
- **Received** — all items: `quantityReceived >= quantityOrdered`  
- **PartiallyAllocated** — some received qty has been allocated to locations  
- **Allocated** — all items: `quantityAllocated >= quantityReceived` (terminal success state)

## API Endpoints

### `POST /v1/purchase-orders`
Create a purchase order. `locationId` no longer required.

```json
{
  "supplierId": "uuid",
  "expectedAt": "2026-09-01",
  "notes": "optional",
  "items": [
    { "productId": "uuid", "quantityOrdered": 30, "unitCost": 500 },
    { "productId": "uuid", "quantityOrdered": 40, "unitCost": 300 }
  ]
}
```

### `POST /v1/purchase-orders/:id/receive`
Record physically received quantities. Does **not** add stock to inventory.

```json
{
  "items": [
    { "purchaseItemId": "uuid", "quantityReceived": 15 },
    { "purchaseItemId": "uuid", "quantityReceived": 40 }
  ],
  "notes": "optional"
}
```

### `POST /v1/purchase-orders/:id/allocate`  ← **New**
Assign received stock to specific locations. This is what actually adds stock to inventory via `StockOrchestrationService.addStock()`.

Supports splitting: same item → multiple location entries in one call.

```json
{
  "allocations": [
    { "purchaseItemId": "uuid", "locationId": "uuid-location-a", "quantity": 15 },
    { "purchaseItemId": "uuid", "locationId": "uuid-location-b", "quantity": 15 },
    { "purchaseItemId": "uuid", "locationId": "uuid-location-a", "quantity": 40 }
  ],
  "notes": "optional"
}
```

**Validations:**
- PO must be in `PartiallyReceived`, `Received`, or `PartiallyAllocated` status
- Per item: `allocating quantity ≤ (quantityReceived − quantityAllocated)`

## Database Changes (migration `1787630908150`)

| Change | Detail |
|---|---|
| `purchase_orders.location_id` | **Dropped** — column removed |
| `purchase_item_allocations` | **New table** — records each (item, location, quantity) allocation event |
| `purchase_items.quantity_allocated` | **New column** — running total of allocated qty |
| `purchase_orders_status_enum` | **Extended** — added `partially_allocated`, `allocated` |

### `purchase_item_allocations` schema

```
id               uuid PK
organization_id  uuid
purchase_order_id uuid FK → purchase_orders
purchase_item_id uuid FK → purchase_items (CASCADE delete)
location_id      uuid FK → locations
quantity         numeric(18,4)
performed_by_id  uuid FK → users (nullable)
notes            text (nullable)
created_at       timestamp
```

## Files Changed

### New Files
- `src/application/modules/purchase-orders/commands/allocate-purchaseorder/` — command + handler + index
- `src/application/modules/purchase-orders/domain/purchase-item-allocation.model.ts`
- `src/application/modules/purchase-orders/i-purchase-item-allocation.repo.ts`
- `src/application/modules/purchase-orders/models/requests/allocate-purchaseorder.request.ts`
- `src/infrastructure/persistence/entities/purchase-item-allocation.entity.ts`
- `src/infrastructure/persistence/repositories/purchase-item-allocation.repo.ts`
- `src/infrastructure/persistence/migrations/1787630908150-migration.ts`

### Modified Files
- `e-purchase-order-status.ts` — two new statuses
- `purchase-order.entity.ts` — removed `locationId`, `location` relation
- `purchase-item.entity.ts` — added `quantityAllocated`
- `receive-purchaseorder.command-handler.ts` — removed stock addition; receive now only tracks qty
- `purchase-orders.controller.ts` — added `/allocate` endpoint; removed `assertLocationAccess` on PO-level
- All request/response/domain DTOs — `locationId` removed where it was PO-level

## Frontend Impact (ERP-Client)

The **Verify Receipt** table/modal needs to be expanded to include location assignment:

1. **Receive step** — existing table showing items + qty input (no location picker needed here)
2. **Allocate step** — expanded table with per-row location dropdown + quantity input, supporting split rows per item
3. PO list/detail — remove any display of `locationId`; show new statuses (`partially_allocated`, `allocated`)
4. PO create form — remove location field
