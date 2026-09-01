# Tenant Isolation Audit — 2026-08-21

Five parallel file-by-file passes across `core-apis` (this repo) and `ERP-Client`, covering every
module's command handlers, query handlers, guards, and matching frontend calls. This file records
what the backend pass found and what this branch fixes. Method: handler-level source read, no
speculation — every finding below was confirmed by reading the actual code, not inferred.

## The pattern

Six of the eight cross-tenant findings share one root cause: `list`/`search`/`delete` endpoints
skip the org-scoping check their sibling `create`/`update` endpoint on the *same controller*
already uses. Read as a missed step during scaffolding, not eight unrelated bugs — the fix is the
same one-line shape everywhere: call `assertOrgOwnership` / set `organizationId` the way the
correct sibling endpoint already does.

## Fixed in this branch

| # | Module | Endpoint | Defect | Fix |
|---|---|---|---|---|
| 1 | customers | `GET /customers` (search) | No org filter — returned every organization's customers | `search()` now sets `query.organizationId = requireOrganizationId(user)`, matching `BillsController.search()` |
| 2 | payment-transactions | `DELETE /payment-transactions/:id` | No ownership check — any org could delete another org's transaction | `delete()` now fetches-and-`assertOrgOwnership`s first, matching the controller's own `update()` |
| 3 | credit-approvals | `POST :id/approve`, `POST :id/reject`, `POST commissions/:id/mark-paid` | No org check on any of the three | Added `organizationId` to all three commands, set from `requireOrganizationId(user)` in the controller, checked in each handler before mutating |
| 4 | activity-logs | `POST /activity-logs` (create) | No org check — any user could forge audit entries into another org | `create()` now forces `command.organizationId = requireOrganizationId(user)`, overriding whatever the client sent |
| 5 | stock-transfers | `GET /stock-transfer-requests/:id` | No org scoping — any org could read another org's transfer request | `getById()` now calls `assertOrgOwnership` after fetch, matching every other endpoint in the file |
| 6 | vehicles / drivers / trips | `GET` (search), `GET list` | Zero org filtering — returned every organization's fleet | `search()`/`list()` on all three now scope by org. Vehicles/drivers filter at the DB (`companyId`/`organizationId` added to the query DTOs). Trips has no direct org column — filtered in memory against the org's vehicle IDs (`vehicleId -> vehicle.companyId`); see `ponytail:` comment in `trips.controller.ts` for the DB-level upgrade path if trip volume ever makes this slow |
| 7 | vehicles / drivers / trips | `DELETE /:id` | No ownership check — any `StoreManager+` could delete another org's vehicle/driver/trip | `delete()` on all three now fetches-and-`assertOrgOwnership`s first, matching each module's own `update()` |
| 8 | orders / invoices / item-returns | `POST` (create) | Org membership of the target location wasn't verified before writing | `create()` on all three now fetches the target location (or, for invoices, the order → location) and `assertOrgOwnership`s before executing the command |

**Also fixed, found while fixing #6/#7, not one of the original eight:** `item-returns`
`search()`/`list()`/`delete()` had the identical unscoped pattern. `ItemReturn` also carries no
direct org column, so `search()`/`list()` use the same in-memory filter approach as trips
(`locationId -> location.organizationId`); see the matching `ponytail:` comment in
`item-returns.controller.ts`.

## Verification

- `npx tsc --noEmit` — clean.
- `npx eslint` on all 18 touched files — clean.
- No schema/migration change — every fix is guard logic in a controller or command-handler, no
  entity or column changes.

## Not in this branch — still open

From the same audit pass, not addressed here:

- **High (data integrity, not access control):** PO-receive, accept-stock-transfer-request, and
  claim-stock-transfer-request are each three separate non-transactional writes — a crash or
  client retry mid-sequence can double-credit or permanently lose stock. A fourth,
  lower-severity race exists in `StockOrchestrationService.adjustStock`'s audit-trail
  `quantityBefore` read (stock count itself is unaffected, only the logged history under
  concurrent writes).
- **Medium:** `get-costly-products` hardcodes `totalMargin: 0`; `get-stock-damage-summary`
  hardcodes `topProducts[].value: 0`. `platform-configurations.getById` has no role guard at all
  (any authenticated user, any org, can read a config by ID if they know the UUID).
- **Dead/orphaned code:** `report-generation-logs` is never triggered by real PDF/report
  generation; a second, bypassing `create-stock-movement` command is never dispatched from any
  controller; eight fleet entities (`TripCheckpoint`, `TripEvent`, `TripGoods`,
  `VehicleDriverAssignment`, `VehicleDocument`, `VehicleInsurance`, `VehicleLocation`,
  `GpsDevice`) have no reader or writer anywhere; `FuelTransaction` has no create path so the
  fuel-cost KPI is permanently zero; the `Orders` frontend module (`ERP-Client`) is an empty
  directory with no route.
- **ERP-Client:** six working pages (Invoices, Payment Transactions, Item Returns, Purchase
  Items, Report Generation Logs, Platform Configurations) are routed but missing from the sidebar
  nav (`config/modules.ts`).
