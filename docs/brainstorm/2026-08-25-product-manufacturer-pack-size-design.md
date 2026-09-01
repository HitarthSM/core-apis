# Product Manufacturer + Pack Size Design

**Date:** 2026-08-25
**Branch:** feature/purchase-order-post-location-allocation
**Status:** Approved — implementing

---

## Problem

1. Products cannot be identified by their manufacturer/brand. Two products named "Mineral Water" from different companies are indistinguishable.
2. Products that ship in packs (e.g., 500 units per box) have no way to express that pack size. Sales staff cannot enter quantities in packs, and inventory displays cannot show "X packs + Y loose units".

---

## Decisions

- **manufacturer** — nullable `varchar(255)` on `products`. Free text (not a foreign key entity). Consistent with existing nullable identification fields (`sku`, `barcode`).
- **packSize** — nullable `integer` on `products`. Null means "no pack concept" (equivalent to 1). The conversion factor between the pack UoM and the base unit.
- **Inventory tracking** — always in base units. `packSize` is a display/input conversion factor only. No change to `inventory`, `stock_movements`, or `unpublished_stock`.
- **Sales (order_items)** — add `packQuantity` (decimal 18,4, nullable) and `packSizeSnapshot` (integer, nullable). `quantity` (units) remains the source of truth for stock deduction. `packSizeSnapshot` is denormalized at transaction time so historical records compute correctly if `packSize` later changes.
- **Purchase (purchase_items)** — same pattern as order_items. Lower priority but symmetric.

---

## Production ERP Pattern

Production ERPs (Odoo, SAP) separate **base UoM** from **transaction UoM**:
- Inventory: base UoM (units) — immutable source of truth
- Sales/purchase inputs: alternative UoM (packs) with a conversion factor
- Conversion factor is snapshotted at transaction time

This design applies that pattern without a full UoM table — `packSize` is the single conversion factor per product, which is sufficient when pack size is fixed per product.

---

## Schema Changes — One Migration

| Table | Column | Type | Nullable | Notes |
|---|---|---|---|---|
| `products` | `manufacturer` | `varchar(255)` | yes | Brand / manufacturer name |
| `products` | `pack_size` | `integer` | yes | Units per pack; null = no pack concept |
| `order_items` | `pack_quantity` | `decimal(18,4)` | yes | Quantity expressed in packs at sale time |
| `order_items` | `pack_size_snapshot` | `integer` | yes | Product packSize at time of sale |
| `purchase_items` | `pack_quantity` | `decimal(18,4)` | yes | Quantity expressed in packs at PO time |
| `purchase_items` | `pack_size_snapshot` | `integer` | yes | Product packSize at time of PO |

---

## Files Touched

### Infrastructure
- `product.entity.ts` — `manufacturer?`, `packSize?`
- `order-item.entity.ts` — `packQuantity?`, `packSizeSnapshot?`
- `purchase-item.entity.ts` — `packQuantity?`, `packSizeSnapshot?`

### Domain Models
- `product.model.ts` — `manufacturer?`, `packSize?`
- `purchase-item.model.ts` — `packQuantity?`, `packSizeSnapshot?`

### Product Module (Application)
- `create-product.command.ts` — `manufacturer?`, `packSize?`
- `update-product.command.ts` — `manufacturer?`, `packSize?`
- `create-product.request.ts` — `@IsString manufacturer?`, `@IsInt @Min(1) packSize?`
- `update-product.request.ts` — same
- `product.response.ts` — `manufacturer?`, `packSize?`
- `product.profile.ts` — no change (AutoMapper convention)

### PurchaseItems Module (Application)
- `create-purchase-item.command.ts` — `packQuantity?`, `packSizeSnapshot?`
- `create-purchase-item.request.ts` — `@IsNumber @Min(1) packQuantity?`
- `purchase-item.response.ts` — `packQuantity?`, `packSizeSnapshot?`, `looseUnits?`
- `purchase-item.model.ts` — `packQuantity?`, `packSizeSnapshot?`
- `create-purchase-item.command-handler.ts` — pack→unit conversion logic

### Inventory Module (Application)
- `inventory.model.ts` — `packsOnHand?`, `looseUnits?`
- `inventory.response.ts` — `packsOnHand?`, `looseUnits?`
- `get-inventory.query-handler.ts` — join product, compute pack breakdown
- `list-inventory.query-handler.ts` — same

### Migration
- Generated via `npm run migration:generate` after entity changes
- Added to `migrations/index.ts` barrel

---

## Business Rules

1. `packQuantity` provided in request → handler loads product, asserts `packSize != null`, sets `quantity = packQuantity × packSize`, stores `packSizeSnapshot = product.packSize`.
2. `quantity` provided directly (no `packQuantity`) → stored as-is; `packQuantity` and `packSizeSnapshot` remain null.
3. Both `packQuantity` and `quantity` in same request → validation error (400).
4. `packQuantity` provided but product has no `packSize` → validation error (400).
5. Inventory `packsOnHand = floor(quantityOnHand / packSize)`, `looseUnits = quantityOnHand % packSize`. Both null when product has no `packSize`.

---

## Frontend Integration (ERP-Client)

- **Product form** (create/edit): add `manufacturer` text input and `packSize` number input.
- **Purchase order line items**: add optional "Pack Qty" input. When pack qty entered, unit qty auto-computes (`packQty × packSize`) for display.
- **Inventory table**: add "Packs" and "Loose" columns. Hidden when product has no `packSize`.
- **Sales order line items** (when order-items UI is built): same pack qty input as purchase items.
