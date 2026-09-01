# Session Implementation Context

> What was built, merged, and deployed across `core-apis` and `ERP-Client` in this session.

---

## Backend — `core-apis`

### Vehicle & Transportation Management Module
**Branch:** `feat/vehicle-and-transportation-management` → **PR #40** (merged to `develop`)

#### APIs Implemented

| Resource | Endpoints | Description |
|---|---|---|
| Vehicles | `POST /api/v1/vehicles` `GET /api/v1/vehicles` `GET /api/v1/vehicles/:id` `PUT /api/v1/vehicles/:id` `DELETE /api/v1/vehicles/:id` | Fleet vehicle CRUD, org-scoped via `@CurrentUser()` |
| Drivers | `POST /api/v1/drivers` `GET /api/v1/drivers` `GET /api/v1/drivers/:id` `PUT /api/v1/drivers/:id` `DELETE /api/v1/drivers/:id` | Driver management with license details |
| Trips | `POST /api/v1/trips` `GET /api/v1/trips` `GET /api/v1/trips/:id` `PUT /api/v1/trips/:id` `DELETE /api/v1/trips/:id` | Trip scheduling and status tracking |
| Maintenance | `POST /api/v1/maintenance` `GET /api/v1/maintenance` | Maintenance records (create + list) |
| Vehicle Expenses | `POST /api/v1/vehicle-expenses` `GET /api/v1/vehicle-expenses/:id` `DELETE /api/v1/vehicle-expenses/:id` | Expense tracking per vehicle |
| Analytics | `GET /api/v1/analytics/fleet-summary` `GET /api/v1/analytics/financial-kpis` | Aggregated fleet KPIs |

#### Key Patterns Applied
- All `organizationId` sourced from `@CurrentUser()` — never from request body
- `ClerkAuthGuard` on all controllers
- Commands extend `CommandBase`, queries extend `QueryBase`
- Handlers use `@CommandHandlerStrict` / `@QueryHandlerStrict`
- Dispatch via `CqrsMediator.execute<T, R>()` — no direct `CommandBus`/`QueryBus`
- `@AutoMap()` on all command/query/domain/DTO fields

#### Entities Added (TypeORM)
`vehicle_types`, `vehicle_brands`, `fuel_types`, `vehicles`, `drivers`, `vehicle_driver_assignments`, `vehicle_locations`, `trips`, `trip_checkpoints`, `trip_goods`, `trip_events`, `fuel_transactions`, `maintenance`, `maintenance_types`, `maintenance_parts`, `vehicle_expenses`, `vehicle_documents`, `driver_documents`, `vehicle_insurance`, `transportation_orders`, `transportation_order_items`, `gps_devices`, `alerts`

#### Update Request Constraints (important for frontend)
- `UpdateVehicleRequest`: only `vehicleNumber`, `vinNumber`, `vehicleTypeId`, `status`
- `UpdateDriverRequest`: `firstName`, `lastName`, `phone`, `email`, `licenseNumber`, `licenseType`, `employeeId`, `address`, `emergencyContact` — **no status field**
- `UpdateTripRequest`: only `tripStatus`, `remarks`

---

### Transportation Reference Data Seeders
**Branch:** `feat/transportation-seeders` → **PR #41** (open against `develop`)

| Seeder | Table | Count |
|---|---|---|
| `VehicleTypesSeed` | `core.vehicle_types` | 10 types |
| `VehicleBrandsSeed` | `core.vehicle_brands` | 15 brands |
| `FuelTypesSeed` | `core.fuel_types` | 8 fuel types |
| `MaintenanceTypesSeed` | `core.maintenance_types` | 18 maintenance types |

All follow `BaseSeed` pattern — idempotent, equality-checked on `name`/`brandName`.

---

### Page Access Configuration
**Merged to `develop`** (PR from page-access feature branch)

- Table: `core.page_access_configs` (`page_key`, `allowed_roles` simple-array)
- API: `GET /api/v1/page-access` (list), `PUT /api/v1/page-access` (bulk update)
- 34 rows seeded on **local** and **dev (Neon)** databases
- `page-access` page restricted to `super_admin` only
- `organizations` restricted to `super_admin` only
- All other admin pages accessible to `super_admin` + `org_admin`

#### Dev Database (Neon)
```
Host: ep-lucky-haze-awcld48i.c-12.us-east-1.aws.neon.tech
DB: core_db | User: neondb_owner | SSL: true
```

---

### Conflict Resolution — PR #40 vs develop
Five files had additive conflicts — both sides kept:

| File | Resolution |
|---|---|
| `src/application/constants.ts` | Vehicle constants + `PAGE_ACCESS_REPO` |
| `src/infrastructure/infrastructure.module.ts` | Vehicle repos + `PageAccessRepo` in providers/exports |
| `src/infrastructure/persistence/entities/index.ts` | All vehicle entities + `PageAccessEntity` |
| `src/infrastructure/persistence/migrations/index.ts` | Both migrations (page-access `1786179977432` + vehicle `1786218933007`) |
| `src/infrastructure/persistence/repositories/index.ts` | Vehicle repos + `page-access.repo` |

---

## Frontend — `ERP-Client`

### Fleet Management Module
**Branch:** `feat/fleet-management-module` → **PR #19** (merged to `main`)

#### 6 Pages Added under `/fleet/*`

| Page | Path | Features |
|---|---|---|
| Fleet Dashboard | `/fleet` | KPI stat cards, vehicle status pie chart, driver status pie chart, trip priority bar chart, recent trips table |
| Vehicles | `/fleet/vehicles` | Full CRUD against `/api/v1/vehicles`; SeedPanel SQL for reference tables; edit scoped to `UpdateVehicleRequest` fields |
| Drivers | `/fleet/drivers` | Full CRUD against `/api/v1/drivers`; edit excludes status (not in `UpdateDriverRequest`) |
| Trips | `/fleet/trips` | Full CRUD; vehicle + driver dropdowns; customer UUID input; edit limited to `tripStatus + remarks` |
| Maintenance | `/fleet/maintenance` | Create-only form (API has no list); session-local display; SeedPanel SQL for `maintenance_types` |
| Vehicle Expenses | `/fleet/expenses` | Create + delete; session-local display with running total; trip linkage dropdown |

#### Sidebar — Fleet Management Group Added (`config/modules.ts`)
```
Fleet Management
  ├── Fleet Dashboard     /fleet
  ├── Vehicles            /fleet/vehicles
  ├── Drivers             /fleet/drivers
  ├── Trips               /fleet/trips
  ├── Maintenance         /fleet/maintenance
  └── Vehicle Expenses    /fleet/expenses
```

#### Types Added (`renderer/src/types.ts`)
`FleetVehicle`, `FleetDriver`, `FleetTrip`, `FleetMaintenance`, `FleetExpense`, `FleetVehicleStatus`, `FleetDriverStatus`, `FleetTripStatus`, `FleetExpenseType`

#### API Resources Added (`renderer/src/api.ts`)
- `FleetVehicles` — `createResource<FleetVehicle>('/api/v1/vehicles', ...)`
- `FleetDrivers` — `createResource<FleetDriver>('/api/v1/drivers', ...)`
- `FleetTrips` — `createResource<FleetTrip>('/api/v1/trips', ...)`
- `FleetMaintenanceApi` — custom `useCreate` mutation
- `FleetExpensesApi` — custom `useGet`, `useCreate`, `useDelete`

#### Shared Badge Components (exported from `Fleet/index.tsx`)
`TripStatusBadge`, `VehicleStatusBadge`, `DriverStatusBadge`

---

### Sidebar Skeleton Fix
**Branch:** `fix/sidebar-loading-skeleton` → **PR #22** (open against `main`)

**Problem:** `isLoading ? MODULES : filteredModules` showed all sidebar items during page-access API load then collapsed — visible flash on every workspace load.

**Fix:** Replaced with animated skeleton rows (4 groups, varying item counts) while `canAccess()` resolves. Works in both collapsed and expanded states.

---

### Page Access Context Fixes (`PageAccessContext.tsx` + `Sidebar.tsx`)

**PageAccessContext:**
- Added `isAdmin` (checks `super_admin | admin | org_admin`) exported from context
- `canAccess()` remains strictly DB-driven — no open-access fallback
- `super_admin` role bypasses all checks (returns `true` for everything)

**Sidebar:**
- `adminOnly` flag in `modules.ts` now enforced — admin-only pages always shown to `isAdmin` users regardless of DB config
- This means `page-access`, `users`, `roles`, `organizations`, etc. are always visible to admins so they can bootstrap configuration

---

### Claude Skills Committed
**Branch:** `chore/add-claude-skills` → **PR #21** (open against `main`)

10 skills under `.claude/skills/`: `brainstorming`, `grill-me`, `receiving-code-review`, `search`, `senior-frontend`, `senior-prompt-engineer`, `subagent-driven-development`, `systematic-debugging`, `using-git-worktrees`, `verification-before-completion`

---

---

### Purchase Order Post-Location Allocation
**Branch:** `feature/purchase-order-post-location-allocation` → **PR #80** (open against `develop`)

Decoupled allocation from receiving — stock can now be allocated to warehouse locations after goods are marked received rather than in the same step.

Key changes:
- `locationId` removed from `PurchaseOrder` entity (was required at PO creation, now irrelevant)
- New `POST /api/v1/purchase-orders/:id/allocate` endpoint — accepts `{ allocations: [{ purchaseItemId, locationId, quantity }] }` and creates `PurchaseItemAllocation` records
- `PurchaseItemAllocationRepo` + entity added
- PO status machine: `received → partially_allocated → allocated`

---

### Product Manufacturer & Pack-Size
**Branch:** `feature/purchase-order-post-location-allocation` (same branch, second commit) → **PR #80**

**Design doc:** `docs/brainstorm/2026-08-25-product-manufacturer-pack-size-design.md`

#### Schema additions (migration `1787681135660`)
| Table | Column | Type | Notes |
|---|---|---|---|
| `core.products` | `manufacturer` | `varchar(255)` nullable | Brand/maker name |
| `core.products` | `pack_size` | `integer` nullable | Base units per pack; null = sold individually |
| `core.purchase_items` | `pack_quantity` | `numeric(18,4)` nullable | Packs ordered (input); null = ordered in units |
| `core.purchase_items` | `pack_size_snapshot` | `integer` nullable | `packSize` at order time — denormalised for history |
| `core.order_items` | `pack_quantity` | `numeric(18,4)` nullable | Schema-ready for future sales integration |
| `core.order_items` | `pack_size_snapshot` | `integer` nullable | As above |

#### Behaviour
- `CreatePurchaseItemCommandHandler`: if `packQuantity` is supplied, fetches `product.packSize`, converts → `quantityOrdered = packQuantity × packSize`, sets `packSizeSnapshot`. Throws 400 if product has no `packSize`.
- Stock is always stored and moved in **base units**. Pack size is a display/input conversion factor only.
- `InventoryRepo.modifyFindOption` loads `product` relation on every list/search so the mapper can compute `packsOnHand` (floor) and `looseUnits` (mod) as derived read-only fields.

---

## Frontend — `ERP-Client`

### Product Manufacturer & Pack-Size
**Branch:** `feature/product-manufacturer-pack-size` → **PR #48** (open against `main`)

#### `types.ts` changes
- `Product`: added `manufacturer?: string`, `packSize?: number`
- `InventoryItem`: added `productPackSize?: number`, `packsOnHand?: number`, `looseUnits?: number`
- `PurchaseItem`: added `packQuantity?: number`, `packSizeSnapshot?: number`
- `CreatePurchaseOrderItemInput`: `quantityOrdered` made optional; added `packQuantity?: number`

#### UI changes
| File | Change |
|---|---|
| `ProductOnboardingWizard.tsx` | "Manufacturer / Brand" text field + "Pack Size (units per pack)" number field added to step 1 — Product Details; both sent in create/update on step 1 → 2 transition |
| `Inventory/index.tsx` | View drawer shows "Packs on Hand" + "Loose Units" rows when `productPackSize` is present |
| `PurchaseOrderDetail/index.tsx` | Line item stats row shows "Packs: N × M units" when `packQuantity` + `packSizeSnapshot` are present |

---

## PR Summary

| Repo | PR | Branch | Status | Description |
|---|---|---|---|---|
| core-apis | #40 | `feat/vehicle-and-transportation-management` | Merged | Vehicle & transportation module |
| core-apis | #41 | `feat/transportation-seeders` | Open | Transportation reference data seeders |
| core-apis | #80 | `feature/purchase-order-post-location-allocation` | Open | PO post-location allocation + product manufacturer/pack-size |
| ERP-Client | #19 | `feat/fleet-management-module` | Merged | Fleet management 6-page module |
| ERP-Client | #21 | `chore/add-claude-skills` | Open | Claude Code skills |
| ERP-Client | #22 | `fix/sidebar-loading-skeleton` | Open | Sidebar skeleton loading fix |
| ERP-Client | #48 | `feature/product-manufacturer-pack-size` | Open | Product manufacturer/pack-size frontend integration |

---

## Database Bootstrap — `core.page_access_configs`

Run on fresh DB to seed all 34 page access rows. Already applied to local and Neon dev.

```sql
INSERT INTO core.page_access_configs (page_key, allowed_roles) VALUES
  ('dashboard',          'super_admin,org_admin,store_manager,store_staff'),
  ('dashboard-sales',    'super_admin,org_admin,store_manager'),
  ('dashboard-purchase', 'super_admin,org_admin,store_manager'),
  ('dashboard-inventory','super_admin,org_admin,store_manager'),
  ('dashboard-warehouse','super_admin,org_admin,store_manager'),
  ('pos',                'super_admin,org_admin,store_manager,store_staff'),
  ('customers',          'super_admin,org_admin,store_manager,store_staff'),
  ('orders',             'super_admin,org_admin,store_manager,store_staff'),
  ('suppliers',          'super_admin,org_admin,store_manager'),
  ('purchase-orders',    'super_admin,org_admin,store_manager'),
  ('bills',              'super_admin,org_admin,store_manager'),
  ('inventory',          'super_admin,org_admin,store_manager'),
  ('stock-movements',    'super_admin,org_admin,store_manager'),
  ('stock-transfers',    'super_admin,org_admin,store_manager'),
  ('unpublished-stock',  'super_admin,org_admin,store_manager'),
  ('products',           'super_admin,org_admin,store_manager'),
  ('categories',         'super_admin,org_admin,store_manager'),
  ('product-logs',       'super_admin,org_admin,store_manager'),
  ('stores',             'super_admin,org_admin'),
  ('warehouses',         'super_admin,org_admin'),
  ('fleet-dashboard',    'super_admin,org_admin,store_manager'),
  ('fleet-vehicles',     'super_admin,org_admin,store_manager'),
  ('fleet-drivers',      'super_admin,org_admin,store_manager'),
  ('fleet-trips',        'super_admin,org_admin,store_manager'),
  ('fleet-maintenance',  'super_admin,org_admin,store_manager'),
  ('fleet-expenses',     'super_admin,org_admin,store_manager'),
  ('users',              'super_admin,org_admin'),
  ('roles',              'super_admin,org_admin'),
  ('user-roles',         'super_admin,org_admin'),
  ('organizations',      'super_admin'),
  ('activity-logs',      'super_admin,org_admin'),
  ('audit-log',          'super_admin,org_admin'),
  ('expenses',           'super_admin,org_admin'),
  ('page-access',        'super_admin')
ON CONFLICT (page_key) DO NOTHING;
```

---

## Architecture Notes

### Backend Stack
- NestJS + TypeScript + TypeORM (Postgres / Neon)
- CQRS via `CqrsMediator` — never direct `CommandBus`/`QueryBus`
- AutoMapper for DTO ↔ domain mapping
- Clerk for authentication (`ClerkAuthGuard`, `@CurrentUser()`)
- All org-scoped resources read `organizationId` from JWT, not request body

### Frontend Stack
- Electron desktop app — React 19 + TypeScript + Vite
- Tailwind CSS 4 + Radix UI
- TanStack React Query for server state
- `createResource<T>()` factory generates all CRUD hooks
- `usePagination()` hook for debounced search + page state
- `DataTable` + `FormDrawer` + `ViewDrawer` + `ConfirmDialog` component system
- Clerk for auth (`AuthContext` → `PageAccessContext` → sidebar filtering)
- Recharts for all analytics/dashboard charts

### Roles
| Role | Access |
|---|---|
| `super_admin` | All pages, all orgs, page-access config |
| `org_admin` | All operational pages within org, user/role management |
| `store_manager` | Operational pages (inventory, sales, fleet, purchases) |
| `store_staff` | POS, customers, orders only |
