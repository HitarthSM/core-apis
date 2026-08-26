import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1787251424817 implements MigrationInterface {
  name = "Migration1787251424817";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "core"`);
    await queryRunner.query(
      `CREATE TABLE "public"."seeds" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, version integer NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK__seeds" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."roles_name_enum" AS ENUM('super_admin', 'org_admin', 'org_manager', 'store_manager', 'store_staff')`);
    await queryRunner.query(
      `CREATE TABLE "core"."roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" "core"."roles_name_enum" NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_roles" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."user_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "role_id" uuid NOT NULL, "store_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_user_roles" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "description" text, "parent_id" uuid, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_categories" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "location_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity_on_hand" numeric(18,4) NOT NULL DEFAULT '0', "quantity_reserved" numeric(18,4) NOT NULL DEFAULT '0', "reorder_level" numeric(18,4) NOT NULL DEFAULT '0', "max_stock" numeric(18,4), "average_cost" numeric(18,4), "bin_location" character varying(100), "quantity_unpublished" numeric(18,4) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ__inventory__org_location_product" UNIQUE ("organization_id", "location_id", "product_id"), CONSTRAINT "PK_inventory" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."suppliers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "contact_person" character varying(255), "email" character varying(255), "phone" character varying(20), "address" text, "tax_id" character varying(100), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_suppliers" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."purchase_orders_status_enum" AS ENUM('draft', 'ordered', 'partially_received', 'received', 'cancelled')`);
    await queryRunner.query(
      `CREATE TABLE "core"."purchase_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "location_id" uuid NOT NULL, "supplier_id" uuid NOT NULL, "created_by_id" uuid, "po_number" character varying(50) NOT NULL, "status" "core"."purchase_orders_status_enum" NOT NULL DEFAULT 'draft', "expected_at" TIMESTAMP, "received_at" TIMESTAMP, "total_amount" numeric(18,4) NOT NULL DEFAULT '0', "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_74065a5d2b8c4c14b8b8fcf0159" UNIQUE ("po_number"), CONSTRAINT "PK_purchase_orders" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."purchase_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "purchase_order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity_ordered" numeric(18,4) NOT NULL, "quantity_received" numeric(18,4) NOT NULL DEFAULT '0', "unit_cost" numeric(18,4) NOT NULL, "total_cost" numeric(18,4) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_purchase_items" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."product_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "storage_key" character varying(500) NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "is_primary" boolean NOT NULL DEFAULT false, "uploaded_by_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_product_images" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."product_suppliers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "supplier_id" uuid NOT NULL, "is_default" boolean NOT NULL DEFAULT false, "unit_cost" numeric(18,4), "lead_time_days" integer, "min_order_qty" numeric(18,4), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_product_suppliers" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ__product_suppliers__product_supplier" ON "core"."product_suppliers" ("product_id", "supplier_id") `);
    await queryRunner.query(`CREATE TYPE "core"."products_unit_enum" AS ENUM('piece', 'kg', 'gram', 'litre', 'ml', 'box', 'pack', 'dozen')`);
    await queryRunner.query(
      `CREATE TABLE "core"."products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "category_id" uuid, "created_by_id" uuid, "name" character varying(255) NOT NULL, "sku" character varying(100), "barcode" character varying(100), "description" text, "unit" "core"."products_unit_enum" NOT NULL DEFAULT 'piece', "cost_price" numeric(18,4) NOT NULL DEFAULT '0', "retail_price" numeric(18,4) NOT NULL DEFAULT '0', "loyalty_price" numeric(18,4) NOT NULL DEFAULT '0', "wholesale_price" numeric(18,4) NOT NULL DEFAULT '0', "transfer_price" numeric(18,4) NOT NULL DEFAULT '0', "reorder_point" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_products" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."stock_movements_movement_type_enum" AS ENUM('stock_in', 'stock_out', 'adjustment', 'transfer_in', 'transfer_out', 'return', 'damage', 'write_off', 'published', 'reserved', 'reservation_released')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."stock_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "inventory_id" uuid NOT NULL, "location_id" uuid NOT NULL, "product_id" uuid NOT NULL, "performed_by_id" uuid, "reference_id" uuid, "reference_type" character varying(50), "movement_type" "core"."stock_movements_movement_type_enum" NOT NULL, "quantity" numeric(18,4) NOT NULL, "quantity_before" numeric(18,4) NOT NULL, "quantity_after" numeric(18,4) NOT NULL, "unit_cost" numeric(18,4), "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_stock_movements" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."activity_logs_action_enum" AS ENUM('login', 'logout', 'add_stock', 'remove_stock', 'adjust_stock', 'transfer_stock', 'create_product', 'update_product', 'delete_product', 'create_purchase_order', 'receive_purchase_order', 'cancel_purchase_order', 'create_store', 'update_store', 'create_user', 'update_user', 'deactivate_user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "organization_id" uuid NOT NULL, "location_id" uuid, "action" "core"."activity_logs_action_enum" NOT NULL, "entity_type" character varying(100), "entity_id" uuid, "metadata" jsonb, "ip_address" character varying(50), "user_agent" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_activity_logs" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid, "first_name" character varying(255), "last_name" character varying(255), "email" character varying(255) NOT NULL, "clerk_user_id" character varying(255), "password_hash" character varying(255), "phone" character varying(20), "avatar_url" character varying(255), "is_active" boolean NOT NULL DEFAULT true, "last_login_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_69b38acaab6341c8769a0058721" UNIQUE ("clerk_user_id"), CONSTRAINT "PK_users" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(100), "email" character varying(255), "phone" character varying(20), "address" text, "country" character varying(100), "clerk_org_id" character varying(255), "logo_url" character varying(255), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_9b7ca6d30b94fef571cff876884" UNIQUE ("name"), CONSTRAINT "UQ_751ccab239dc21f14b7dddd8a1e" UNIQUE ("clerk_org_id"), CONSTRAINT "PK_organizations" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."locations_type_enum" AS ENUM('store', 'warehouse')`);
    await queryRunner.query(
      `CREATE TABLE "core"."locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying(150) NOT NULL, "type" "core"."locations_type_enum" NOT NULL, "image_key" character varying(500), "address" character varying(300), "city" character varying(100), "state" character varying(100), "country" character varying(100), "phone" character varying(50), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_locations" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."product_logs_action_enum" AS ENUM('product_created', 'product_updated', 'product_disabled', 'product_enabled', 'stock_added', 'stock_removed', 'stock_adjusted', 'stock_reserved', 'stock_reservation_released', 'stock_published', 'stock_damaged', 'stock_written_off', 'stock_transferred_out', 'stock_transferred_in')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."product_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "product_id" uuid NOT NULL, "inventory_id" uuid, "location_id" uuid, "performed_by_id" uuid, "action" "core"."product_logs_action_enum" NOT NULL, "changed_fields" jsonb, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_product_logs" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX__product_logs__inventory_created" ON "core"."product_logs" ("inventory_id", "created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX__product_logs__org_created" ON "core"."product_logs" ("organization_id", "created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX__product_logs__product_created" ON "core"."product_logs" ("product_id", "created_at") `);
    await queryRunner.query(`CREATE TYPE "core"."customers_customer_type_enum" AS ENUM('regular', 'new', 'shop', 'big_customer')`);
    await queryRunner.query(
      `CREATE TABLE "core"."customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255), "phone" character varying(20), "gstin" character varying(50), "credit_limit" numeric(18,4), "credit_balance" numeric(18,4) NOT NULL DEFAULT '0', "customer_type" "core"."customers_customer_type_enum", "discount_percent" numeric(5,2), "skip_over_limit_approval" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_customers" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."discount_coupons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "org_id" uuid NOT NULL, "code" character varying(50) NOT NULL, "type" character varying(20) NOT NULL DEFAULT 'percentage', "value" numeric(18,4) NOT NULL, "max_uses" integer, "used_count" integer NOT NULL DEFAULT '0', "valid_from" TIMESTAMP, "valid_until" TIMESTAMP, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_discount_coupons" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7e3ce2a9666b36fb7d96d975ba" ON "core"."discount_coupons" ("org_id", "code") `);
    await queryRunner.query(
      `CREATE TABLE "core"."order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "variant_id" uuid, "quantity" numeric(18,4) NOT NULL, "unit_price" numeric(18,4) NOT NULL, "tax_amount" numeric(18,4) NOT NULL DEFAULT '0', "line_total" numeric(18,4) NOT NULL, CONSTRAINT "PK_order_items" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_number" character varying(50) NOT NULL, "location_id" uuid NOT NULL, "customer_id" uuid NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'PENDING', "subtotal" numeric(18,4) NOT NULL DEFAULT '0', "tax_amount" numeric(18,4) NOT NULL DEFAULT '0', "total_amount" numeric(18,4) NOT NULL DEFAULT '0', "payment_status" character varying(50) NOT NULL DEFAULT 'UNPAID', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_75eba1c6b1a66b09f2a97e6927b" UNIQUE ("order_number"), CONSTRAINT "PK_orders" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "invoice_number" character varying(50) NOT NULL, "total_amount" numeric(18,4) NOT NULL DEFAULT '0', "status" character varying(50) NOT NULL DEFAULT 'DRAFT', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_d8f8d3788694e1b3f96c42c36fb" UNIQUE ("invoice_number"), CONSTRAINT "PK_invoices" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."bill_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bill_id" uuid NOT NULL, "product_id" uuid NOT NULL, "variant_id" uuid, "quantity" numeric(18,4) NOT NULL, "unit_price" numeric(18,4) NOT NULL, "tax_rate" numeric(18,4) NOT NULL DEFAULT '0', "tax_amount" numeric(18,4) NOT NULL DEFAULT '0', "discount_amount" numeric(18,4) NOT NULL DEFAULT '0', "line_total" numeric(18,4) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_bill_items" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."bills_status_enum" AS ENUM('INITIATED', 'DRAFT', 'COMPLETED', 'CANCELLED')`);
    await queryRunner.query(`CREATE TYPE "core"."bills_payment_method_enum" AS ENUM('CASH', 'CARD', 'UPI', 'NET_BANKING', 'CHEQUE', 'CREDIT')`);
    await queryRunner.query(`CREATE TYPE "core"."bills_sale_type_enum" AS ENUM('normal', 'credit', 'black')`);
    await queryRunner.query(`CREATE TYPE "core"."bills_customer_type_enum" AS ENUM('regular', 'new', 'shop', 'big_customer')`);
    await queryRunner.query(`CREATE TYPE "core"."bills_payment_timing_enum" AS ENUM('before_delivery', 'after_delivery', 'half', 'cod')`);
    await queryRunner.query(
      `CREATE TABLE "core"."bills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bill_number" character varying(50) NOT NULL, "organization_id" uuid NOT NULL, "location_id" uuid NOT NULL, "customer_id" uuid, "created_by_id" uuid, "walk_in_name" character varying(255), "walk_in_phone" character varying(30), "walk_in_gstin" character varying(20), "status" "core"."bills_status_enum" NOT NULL DEFAULT 'INITIATED', "payment_method" "core"."bills_payment_method_enum", "sale_type" "core"."bills_sale_type_enum" NOT NULL DEFAULT 'normal', "customer_type" "core"."bills_customer_type_enum", "payment_timing" "core"."bills_payment_timing_enum", "partial_amount" numeric(18,4), "black_amount" numeric(18,4) NOT NULL DEFAULT '0', "facilitator_user_id" uuid, "facilitator_name" character varying(255), "commission_amount" numeric(18,4) NOT NULL DEFAULT '0', "subtotal" numeric(18,4) NOT NULL DEFAULT '0', "tax_amount" numeric(18,4) NOT NULL DEFAULT '0', "discount_amount" numeric(18,4) NOT NULL DEFAULT '0', "total_amount" numeric(18,4) NOT NULL DEFAULT '0', "notes" text, "billed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_df496d8e68bf4899d47956865e2" UNIQUE ("bill_number"), CONSTRAINT "PK_bills" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IX__bills__org_location_status" ON "core"."bills" ("organization_id", "location_id", "status") `);
    await queryRunner.query(
      `CREATE TABLE "core"."payment_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "org_id" uuid NOT NULL, "reference_id" uuid NOT NULL, "reference_type" character varying(50) NOT NULL, "type" character varying(50) NOT NULL, "method" character varying(50) NOT NULL, "amount" numeric(18,4) NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_payment_transactions" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "org_id" uuid NOT NULL, "location_id" uuid, "category" character varying(50) NOT NULL, "amount" numeric(18,4) NOT NULL DEFAULT '0', "expense_date" TIMESTAMP NOT NULL, "description" text, "status" character varying(20) NOT NULL DEFAULT 'pending', "submitted_by" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_expenses" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."return_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "return_id" uuid NOT NULL, "product_id" uuid NOT NULL, "variant_id" uuid, "quantity" numeric(18,4) NOT NULL, CONSTRAINT "PK_return_items" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."item_returns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "location_id" uuid NOT NULL, "order_id" uuid, "supplier_id" uuid, "return_type" character varying(50) NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'pending', "total_amount" numeric(18,4) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_item_returns" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "org_id" uuid NOT NULL, "type" character varying(50) NOT NULL, "title" character varying(255) NOT NULL, "body" text NOT NULL, "read_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_notifications" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."org_activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "org_id" uuid NOT NULL, "actor_id" uuid, "event_type" character varying(100) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_org_activity_logs" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."report_generation_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "org_id" uuid NOT NULL, "report_type" character varying(100) NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'pending', "file_url" character varying(255), "error_message" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_report_generation_logs" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."stock_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "location_id" uuid NOT NULL, "product_id" uuid NOT NULL, "supplier_id" uuid, "quantity" numeric(18,4) NOT NULL, "unit_cost" numeric(18,4) NOT NULL DEFAULT '0', "entry_type" character varying(50) NOT NULL DEFAULT 'purchase', "reference_number" character varying(100), "status" character varying(50) NOT NULL DEFAULT 'completed', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_stock_entries" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."stock_transfer_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transfer_id" uuid NOT NULL, "product_id" uuid NOT NULL, "variant_id" uuid, "quantity_sent" numeric(18,4) NOT NULL, "quantity_received" numeric(18,4) NOT NULL DEFAULT '0', CONSTRAINT "PK_stock_transfer_items" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."stock_transfers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "from_location_id" uuid NOT NULL, "to_location_id" uuid NOT NULL, "transfer_number" character varying(50) NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_e6943db71fc295dca9bbe16b85c" UNIQUE ("transfer_number"), CONSTRAINT "PK_stock_transfers" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."stock_transfer_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "requesting_location_id" uuid NOT NULL, "requesting_user_id" uuid, "product_id" uuid NOT NULL, "variant_id" uuid, "quantity_requested" numeric(18,4) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'OPEN', "accepted_by_location_id" uuid, "accepted_by_user_id" uuid, "accepted_at" TIMESTAMP, "claimed_at" TIMESTAMP, "cancelled_by_user_id" uuid, "cancelled_at" TIMESTAMP, "fulfillment_transfer_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_stock_transfer_requests" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "sku" character varying(100) NOT NULL, "attributes" jsonb, "unit_price" numeric(18,4) NOT NULL DEFAULT '0', "cost_price" numeric(18,4) NOT NULL DEFAULT '0', CONSTRAINT "PK_product_variants" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ceaa413b9fe3dbfd6e889dc5a7" ON "core"."product_variants" ("product_id", "sku") `);
    await queryRunner.query(
      `CREATE TABLE "core"."user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "first_name" character varying(255) NOT NULL, "last_name" character varying(255) NOT NULL, "avatar_url" character varying(255), "timezone" character varying(50) NOT NULL DEFAULT 'UTC', "locale" character varying(10) NOT NULL DEFAULT 'en', CONSTRAINT "UQ_6ca9503d77ae39b4b5a6cc3ba88" UNIQUE ("user_id"), CONSTRAINT "REL_6ca9503d77ae39b4b5a6cc3ba8" UNIQUE ("user_id"), CONSTRAINT "PK_user_profiles" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."user_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" character varying(50) NOT NULL DEFAULT 'home', "line1" character varying(255) NOT NULL, "line2" character varying(255), "city" character varying(100) NOT NULL, "state" character varying(100), "country" character varying(100) NOT NULL, "postal_code" character varying(20) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_user_addresses" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "resource" character varying(100) NOT NULL, "action" character varying(50) NOT NULL, CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"), CONSTRAINT "PK_permissions" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."role_permissions" ("role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("role_id", "permission_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."platforms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "config" jsonb, "maintenance_mode" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_platforms" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."platform_configurations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "config_key" character varying(100) NOT NULL, "config_value" jsonb, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_d0ac8bfebcdb32c2e6d0a16e7ca" UNIQUE ("config_key"), CONSTRAINT "PK_platform_configurations" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."org_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "org_id" uuid NOT NULL, "user_id" uuid NOT NULL, "role_id" uuid NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'active', "invited_by" uuid, "joined_at" TIMESTAMP, CONSTRAINT "PK_org_members" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_986db88b0e82a9189921841199" ON "core"."org_members" ("org_id", "user_id") `);
    await queryRunner.query(`CREATE TYPE "core"."customer_credit_transactions_type_enum" AS ENUM('credit_sale', 'payment', 'adjustment')`);
    await queryRunner.query(
      `CREATE TABLE "core"."customer_credit_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "bill_id" uuid, "type" "core"."customer_credit_transactions_type_enum" NOT NULL, "amount" numeric(18,4) NOT NULL, "balance_before" numeric(18,4) NOT NULL, "balance_after" numeric(18,4) NOT NULL, "performed_by_id" uuid, "payment_method" character varying(50), "note" character varying(500), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_customer_credit_transactions" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."credit_approval_requests_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
    await queryRunner.query(
      `CREATE TABLE "core"."credit_approval_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "customer_id" uuid NOT NULL, "bill_id" uuid NOT NULL, "requested_amount" numeric(18,4) NOT NULL, "requested_by_id" uuid NOT NULL, "status" "core"."credit_approval_requests_status_enum" NOT NULL DEFAULT 'pending', "decided_by_id" uuid, "decided_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_credit_approval_requests" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."commission_payables_status_enum" AS ENUM('owed', 'paid')`);
    await queryRunner.query(
      `CREATE TABLE "core"."commission_payables" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "bill_id" uuid NOT NULL, "facilitator_user_id" uuid, "facilitator_name" character varying(255), "amount" numeric(18,4) NOT NULL, "status" "core"."commission_payables_status_enum" NOT NULL DEFAULT 'owed', "paid_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_commission_payables" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."unpublished_stock_movements_movement_type_enum" AS ENUM('stock_in', 'transfer_out')`);
    await queryRunner.query(
      `CREATE TABLE "core"."unpublished_stock_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "unpublished_stock_id" uuid NOT NULL, "location_id" uuid NOT NULL, "product_id" uuid NOT NULL, "performed_by_id" uuid, "movement_type" "core"."unpublished_stock_movements_movement_type_enum" NOT NULL, "quantity" numeric(18,4) NOT NULL, "quantity_before" numeric(18,4) NOT NULL, "quantity_after" numeric(18,4) NOT NULL, "unit_cost" numeric(18,4), "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_unpublished_stock_movements" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."unpublished_stock" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "location_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity_on_hand" numeric(18,4) NOT NULL DEFAULT '0', "average_cost" numeric(18,4), "bin_location" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ__unpublished_stock__org_location_product" UNIQUE ("organization_id", "location_id", "product_id"), CONSTRAINT "PK_unpublished_stock" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."ref_cities" ("id" integer NOT NULL, "name" character varying(255) NOT NULL, "state_id" integer NOT NULL, "state_code" character varying(10), "country_id" integer NOT NULL, "country_code" character varying(2), "latitude" numeric(11,8), "longitude" numeric(11,8), CONSTRAINT "PK_ref_cities" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."ref_states" ("id" integer NOT NULL, "name" character varying(255) NOT NULL, "country_id" integer NOT NULL, "country_code" character varying(2), "fips_code" character varying(10), "iso2" character varying(10), "latitude" numeric(11,8), "longitude" numeric(11,8), CONSTRAINT "PK_ref_states" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."ref_countries" ("id" integer NOT NULL, "name" character varying(255) NOT NULL, "iso3" character varying(3) NOT NULL, "iso2" character varying(2) NOT NULL, "phone_code" character varying(25), "currency" character varying(10), "currency_symbol" character varying(10), "native" character varying(255), "region" character varying(50), "latitude" numeric(11,8), "longitude" numeric(11,8), "timezones" jsonb, CONSTRAINT "PK_ref_countries" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."ref_currencies" ("id" SERIAL NOT NULL, "code" character varying(10) NOT NULL, "name" character varying(255) NOT NULL, "symbol" character varying(10), "symbol_native" character varying(10), "decimal_digits" integer NOT NULL DEFAULT '2', "rounding" numeric(5,2) NOT NULL DEFAULT '0', "name_plural" character varying(255), CONSTRAINT "UQ_a245452b5daddbf766ce0a85b77" UNIQUE ("code"), CONSTRAINT "PK_ref_currencies" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."ref_languages" ("id" SERIAL NOT NULL, "code" character varying(10) NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "UQ_6ded80eec51006d7471136cdc0c" UNIQUE ("code"), CONSTRAINT "PK_ref_languages" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."page_access_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "page_key" character varying(100) NOT NULL, "allowed_roles" text NOT NULL DEFAULT '', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d81fa12fa601b3f7338a0e76d6b" UNIQUE ("page_key"), CONSTRAINT "PK_3d16468835877c173a5678c419a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."vehicle_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_vehicle_types" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."vehicle_brands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brand_name" character varying(100) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_vehicle_brands" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."fuel_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_fuel_types" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."vehicles_status_enum" AS ENUM('available', 'in_transit', 'maintenance', 'idle', 'out_of_service')`);
    await queryRunner.query(
      `CREATE TABLE "core"."vehicles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vehicle_number" character varying(30) NOT NULL, "vin_number" character varying(100), "registration_number" character varying(50), "company_id" uuid NOT NULL, "vehicle_type_id" uuid NOT NULL, "brand_id" uuid NOT NULL, "model" character varying(100), "manufacture_year" integer, "color" character varying(50), "fuel_type_id" uuid NOT NULL, "tank_capacity" numeric(10,2), "payload_capacity" numeric(10,2), "mileage" numeric(10,2), "purchase_date" date, "purchase_price" numeric(12,2), "insurance_expiry" date, "registration_expiry" date, "status" "core"."vehicles_status_enum" NOT NULL DEFAULT 'available', "image_url" text, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_97a57b7389989efc352bef8af3a" UNIQUE ("vehicle_number"), CONSTRAINT "PK_vehicles" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."drivers_status_enum" AS ENUM('active', 'inactive', 'on_trip', 'suspended')`);
    await queryRunner.query(
      `CREATE TABLE "core"."drivers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "employee_id" character varying(50), "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(150), "license_number" character varying(50) NOT NULL, "license_type" character varying(50), "license_expiry" date, "joining_date" date, "experience_years" integer, "blood_group" character varying(5), "address" text, "emergency_contact" character varying(100), "status" "core"."drivers_status_enum" NOT NULL DEFAULT 'active', "profile_image" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_47543bd8e5e11a094ded9a56e98" UNIQUE ("license_number"), CONSTRAINT "PK_drivers" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."vehicle_driver_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vehicle_id" uuid NOT NULL, "driver_id" uuid NOT NULL, "assigned_date" TIMESTAMP NOT NULL, "released_date" TIMESTAMP, "is_active" boolean NOT NULL DEFAULT true, "remarks" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_vehicle_driver_assignments" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."vehicle_locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vehicle_id" uuid NOT NULL, "latitude" numeric(10,8) NOT NULL, "longitude" numeric(11,8) NOT NULL, "speed" numeric(10,2), "heading" numeric(10,2), "altitude" numeric(10,2), "fuel_level" numeric(10,2), "odometer" numeric(15,2), "engine_status" character varying(50), "gps_time" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_vehicle_locations" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."trips_trip_status_enum" AS ENUM('scheduled', 'in_transit', 'completed', 'cancelled', 'delayed')`);
    await queryRunner.query(
      `CREATE TABLE "core"."trips" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trip_number" character varying(50) NOT NULL, "vehicle_id" uuid NOT NULL, "driver_id" uuid NOT NULL, "customer_id" uuid NOT NULL, "pickup_location" text NOT NULL, "drop_location" text NOT NULL, "start_datetime" TIMESTAMP NOT NULL, "end_datetime" TIMESTAMP, "estimated_distance" numeric(10,2), "actual_distance" numeric(10,2), "estimated_duration" character varying(50), "actual_duration" character varying(50), "trip_status" "core"."trips_trip_status_enum" NOT NULL DEFAULT 'scheduled', "priority" character varying(20) NOT NULL DEFAULT 'medium', "remarks" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_22afe83e1f09437f58906bb38de" UNIQUE ("trip_number"), CONSTRAINT "PK_trips" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."trip_checkpoints" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trip_id" uuid NOT NULL, "location" text NOT NULL, "latitude" numeric(10,8) NOT NULL, "longitude" numeric(11,8) NOT NULL, "arrival_time" TIMESTAMP, "departure_time" TIMESTAMP, "sequence" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_trip_checkpoints" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."trip_goods" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trip_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" numeric(10,2) NOT NULL, "weight" numeric(10,2), "volume" numeric(10,2), "remarks" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_trip_goods" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."trip_events_event_type_enum" AS ENUM('started', 'loading', 'unloading', 'reached', 'fuel_added', 'delay', 'maintenance')`);
    await queryRunner.query(
      `CREATE TABLE "core"."trip_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trip_id" uuid NOT NULL, "event_type" "core"."trip_events_event_type_enum" NOT NULL, "title" character varying(100) NOT NULL, "description" text, "latitude" numeric(10,8), "longitude" numeric(11,8), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_trip_events" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."fuel_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vehicle_id" uuid NOT NULL, "driver_id" uuid NOT NULL, "trip_id" uuid, "fuel_station" character varying(100) NOT NULL, "fuel_quantity" numeric(10,2) NOT NULL, "price_per_liter" numeric(10,2) NOT NULL, "total_cost" numeric(10,2) NOT NULL, "odometer" numeric(15,2), "payment_mode" character varying(50), "receipt_image" text, "filled_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fuel_transactions" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."maintenance_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_maintenance_types" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."maintenance_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'cancelled')`);
    await queryRunner.query(
      `CREATE TABLE "core"."maintenance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vehicle_id" uuid NOT NULL, "maintenance_type_id" uuid NOT NULL, "service_center" character varying(100) NOT NULL, "description" text, "cost" numeric(12,2) NOT NULL, "service_date" date NOT NULL, "next_service_date" date, "odometer" numeric(15,2), "invoice_number" character varying(50), "status" "core"."maintenance_status_enum" NOT NULL DEFAULT 'pending', "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_maintenance" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."maintenance_parts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "maintenance_id" uuid NOT NULL, "part_name" character varying(100) NOT NULL, "quantity" numeric(10,2) NOT NULL, "price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_maintenance_parts" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."vehicle_expenses_expense_type_enum" AS ENUM('fuel', 'toll', 'parking', 'insurance', 'tax', 'washing', 'repair', 'other')`);
    await queryRunner.query(
      `CREATE TABLE "core"."vehicle_expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vehicle_id" uuid NOT NULL, "trip_id" uuid, "expense_type" "core"."vehicle_expenses_expense_type_enum" NOT NULL, "amount" numeric(12,2) NOT NULL, "expense_date" date NOT NULL, "remarks" text, "attachment" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_vehicle_expenses" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."vehicle_documents_document_type_enum" AS ENUM('registration', 'insurance', 'license', 'pollution', 'fitness', 'permit', 'other')`);
    await queryRunner.query(
      `CREATE TABLE "core"."vehicle_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vehicle_id" uuid NOT NULL, "document_type" "core"."vehicle_documents_document_type_enum" NOT NULL, "document_number" character varying(100), "issue_date" date, "expiry_date" date, "file_url" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_vehicle_documents" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."driver_documents_document_type_enum" AS ENUM('registration', 'insurance', 'license', 'pollution', 'fitness', 'permit', 'other')`);
    await queryRunner.query(
      `CREATE TABLE "core"."driver_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "driver_id" uuid NOT NULL, "document_type" "core"."driver_documents_document_type_enum" NOT NULL, "file_url" text NOT NULL, "expiry_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_driver_documents" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."vehicle_insurance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vehicle_id" uuid NOT NULL, "provider" character varying(100) NOT NULL, "policy_number" character varying(100) NOT NULL, "start_date" date NOT NULL, "expiry_date" date NOT NULL, "premium" numeric(12,2) NOT NULL, "coverage" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_vehicle_insurance" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."transportation_order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" numeric(10,2) NOT NULL, "weight" numeric(10,2), "volume" numeric(10,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_transportation_order_items" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."transportation_orders_status_enum" AS ENUM('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')`);
    await queryRunner.query(`CREATE TYPE "core"."transportation_orders_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`);
    await queryRunner.query(
      `CREATE TABLE "core"."transportation_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_number" character varying(50) NOT NULL, "customer_id" uuid NOT NULL, "pickup_address" text NOT NULL, "delivery_address" text NOT NULL, "expected_delivery" TIMESTAMP NOT NULL, "status" "core"."transportation_orders_status_enum" NOT NULL DEFAULT 'pending', "priority" "core"."transportation_orders_priority_enum" NOT NULL DEFAULT 'medium', "remarks" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_24e49ec41e7d5d6acd94a36f41a" UNIQUE ("order_number"), CONSTRAINT "PK_transportation_orders" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."gps_devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "device_number" character varying(50) NOT NULL, "imei" character varying(100) NOT NULL, "vehicle_id" uuid, "provider" character varying(100), "status" character varying(50) NOT NULL DEFAULT 'active', "last_sync" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_e4f4ae395c1315ed738dca33774" UNIQUE ("device_number"), CONSTRAINT "UQ_a5cfb10e3dedb4f64a646fa1b42" UNIQUE ("imei"), CONSTRAINT "PK_gps_devices" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TYPE "core"."alerts_alert_type_enum" AS ENUM('overspeed', 'low_fuel', 'offline', 'maintenance_due', 'insurance_expiring')`);
    await queryRunner.query(`CREATE TYPE "core"."alerts_severity_enum" AS ENUM('low', 'medium', 'high', 'critical')`);
    await queryRunner.query(
      `CREATE TABLE "core"."alerts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vehicle_id" uuid, "driver_id" uuid, "alert_type" "core"."alerts_alert_type_enum" NOT NULL, "severity" "core"."alerts_severity_enum" NOT NULL, "message" text NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'unread', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_alerts" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."email_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "subject" character varying(500) NOT NULL, "html_body" text NOT NULL, "category" character varying(100), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_47fbf61afd456e17d308bb20443" UNIQUE ("slug"), CONSTRAINT "PK_email_templates" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."quick_charges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "label" character varying(100) NOT NULL, "amount" numeric(18,4) NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_quick_charges" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."customer_type_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "customer_type" character varying(32) NOT NULL, "discount_percent" numeric(5,2) NOT NULL DEFAULT '0', "default_credit_limit" numeric(18,4), "skip_over_limit_approval" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ__customer_type_rules__org_type" UNIQUE ("organization_id", "customer_type"), CONSTRAINT "PK_customer_type_rules" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user_roles" ADD CONSTRAINT "FK__user_roles__users" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user_roles" ADD CONSTRAINT "FK__user_roles__roles" FOREIGN KEY ("role_id") REFERENCES "core"."roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user_roles" ADD CONSTRAINT "FK__user_roles__locations" FOREIGN KEY ("store_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."categories" ADD CONSTRAINT "FK__categories__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."categories" ADD CONSTRAINT "FK__categories__parent" FOREIGN KEY ("parent_id") REFERENCES "core"."categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."inventory" ADD CONSTRAINT "FK__inventory__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."inventory" ADD CONSTRAINT "FK__inventory__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."inventory" ADD CONSTRAINT "FK__inventory__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."suppliers" ADD CONSTRAINT "FK__suppliers__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."purchase_orders" ADD CONSTRAINT "FK__purchase_orders__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."purchase_orders" ADD CONSTRAINT "FK__purchase_orders__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."purchase_orders" ADD CONSTRAINT "FK__purchase_orders__suppliers" FOREIGN KEY ("supplier_id") REFERENCES "core"."suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."purchase_orders" ADD CONSTRAINT "FK__purchase_orders__users" FOREIGN KEY ("created_by_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."purchase_items" ADD CONSTRAINT "FK__purchase_items__purchase_orders" FOREIGN KEY ("purchase_order_id") REFERENCES "core"."purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."purchase_items" ADD CONSTRAINT "FK__purchase_items__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."product_images" ADD CONSTRAINT "FK__product_images__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."product_images" ADD CONSTRAINT "FK__product_images__users" FOREIGN KEY ("uploaded_by_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."product_suppliers" ADD CONSTRAINT "FK__product_suppliers__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."product_suppliers" ADD CONSTRAINT "FK__product_suppliers__suppliers" FOREIGN KEY ("supplier_id") REFERENCES "core"."suppliers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."products" ADD CONSTRAINT "FK__products__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."products" ADD CONSTRAINT "FK__products__categories" FOREIGN KEY ("category_id") REFERENCES "core"."categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."products" ADD CONSTRAINT "FK__products__users" FOREIGN KEY ("created_by_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_movements" ADD CONSTRAINT "FK__stock_movements__inventory" FOREIGN KEY ("inventory_id") REFERENCES "core"."inventory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_movements" ADD CONSTRAINT "FK__stock_movements__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_movements" ADD CONSTRAINT "FK__stock_movements__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_movements" ADD CONSTRAINT "FK__stock_movements__users" FOREIGN KEY ("performed_by_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."activity_logs" ADD CONSTRAINT "FK__activity_logs__users" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."activity_logs" ADD CONSTRAINT "FK__activity_logs__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."activity_logs" ADD CONSTRAINT "FK__activity_logs__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."users" ADD CONSTRAINT "FK__users__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."locations" ADD CONSTRAINT "FK__locations__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."product_logs" ADD CONSTRAINT "FK__product_logs__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."product_logs" ADD CONSTRAINT "FK__product_logs__users" FOREIGN KEY ("performed_by_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."customers" ADD CONSTRAINT "FK__customers__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."discount_coupons" ADD CONSTRAINT "FK__discount_coupons__organizations" FOREIGN KEY ("org_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."order_items" ADD CONSTRAINT "FK__order_items__orders" FOREIGN KEY ("order_id") REFERENCES "core"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."order_items" ADD CONSTRAINT "FK__order_items__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."orders" ADD CONSTRAINT "FK__orders__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."orders" ADD CONSTRAINT "FK__orders__customers" FOREIGN KEY ("customer_id") REFERENCES "core"."customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."invoices" ADD CONSTRAINT "FK__invoices__orders" FOREIGN KEY ("order_id") REFERENCES "core"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."bill_items" ADD CONSTRAINT "FK__bill_items__bills" FOREIGN KEY ("bill_id") REFERENCES "core"."bills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."bill_items" ADD CONSTRAINT "FK__bill_items__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."bills" ADD CONSTRAINT "FK__bills__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."bills" ADD CONSTRAINT "FK__bills__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."bills" ADD CONSTRAINT "FK__bills__customers" FOREIGN KEY ("customer_id") REFERENCES "core"."customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."bills" ADD CONSTRAINT "FK__bills__users" FOREIGN KEY ("created_by_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."payment_transactions" ADD CONSTRAINT "FK__payment_transactions__organizations" FOREIGN KEY ("org_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."expenses" ADD CONSTRAINT "FK__expenses__organizations" FOREIGN KEY ("org_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."expenses" ADD CONSTRAINT "FK__expenses__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."return_items" ADD CONSTRAINT "FK__return_items__item_returns" FOREIGN KEY ("return_id") REFERENCES "core"."item_returns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."return_items" ADD CONSTRAINT "FK__return_items__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."item_returns" ADD CONSTRAINT "FK__item_returns__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."item_returns" ADD CONSTRAINT "FK__item_returns__orders" FOREIGN KEY ("order_id") REFERENCES "core"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."item_returns" ADD CONSTRAINT "FK__item_returns__suppliers" FOREIGN KEY ("supplier_id") REFERENCES "core"."suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."notifications" ADD CONSTRAINT "FK__notifications__users" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."notifications" ADD CONSTRAINT "FK__notifications__organizations" FOREIGN KEY ("org_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."org_activity_logs" ADD CONSTRAINT "FK__org_activity_logs__organizations" FOREIGN KEY ("org_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."org_activity_logs" ADD CONSTRAINT "FK__org_activity_logs__actor" FOREIGN KEY ("actor_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."report_generation_logs" ADD CONSTRAINT "FK__report_generation_logs__organizations" FOREIGN KEY ("org_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_entries" ADD CONSTRAINT "FK__stock_entries__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_entries" ADD CONSTRAINT "FK__stock_entries__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_entries" ADD CONSTRAINT "FK__stock_entries__suppliers" FOREIGN KEY ("supplier_id") REFERENCES "core"."suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_transfer_items" ADD CONSTRAINT "FK__stock_transfer_items__stock_transfers" FOREIGN KEY ("transfer_id") REFERENCES "core"."stock_transfers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_transfer_items" ADD CONSTRAINT "FK__stock_transfer_items__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_transfers" ADD CONSTRAINT "FK__stock_transfers__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_transfers" ADD CONSTRAINT "FK__stock_transfers__from_locations" FOREIGN KEY ("from_location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_transfers" ADD CONSTRAINT "FK__stock_transfers__to_locations" FOREIGN KEY ("to_location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_transfer_requests" ADD CONSTRAINT "FK__stock_transfer_requests__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_transfer_requests" ADD CONSTRAINT "FK__stock_transfer_requests__requesting_locations" FOREIGN KEY ("requesting_location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_transfer_requests" ADD CONSTRAINT "FK__stock_transfer_requests__accepted_locations" FOREIGN KEY ("accepted_by_location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_transfer_requests" ADD CONSTRAINT "FK__stock_transfer_requests__requesting_users" FOREIGN KEY ("requesting_user_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_transfer_requests" ADD CONSTRAINT "FK__stock_transfer_requests__accepted_users" FOREIGN KEY ("accepted_by_user_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_transfer_requests" ADD CONSTRAINT "FK__stock_transfer_requests__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."stock_transfer_requests" ADD CONSTRAINT "FK__stock_transfer_requests__stock_transfers" FOREIGN KEY ("fulfillment_transfer_id") REFERENCES "core"."stock_transfers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."product_variants" ADD CONSTRAINT "FK__product_variants__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user_profiles" ADD CONSTRAINT "FK__user_profiles__users" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."user_addresses" ADD CONSTRAINT "FK__user_addresses__users" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role_permissions" ADD CONSTRAINT "FK__role_permissions__roles" FOREIGN KEY ("role_id") REFERENCES "core"."roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role_permissions" ADD CONSTRAINT "FK__role_permissions__permissions" FOREIGN KEY ("permission_id") REFERENCES "core"."permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."org_members" ADD CONSTRAINT "FK__org_members__organizations" FOREIGN KEY ("org_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."org_members" ADD CONSTRAINT "FK__org_members__users" FOREIGN KEY ("user_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."org_members" ADD CONSTRAINT "FK__org_members__roles" FOREIGN KEY ("role_id") REFERENCES "core"."roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."org_members" ADD CONSTRAINT "FK__org_members__invited_by" FOREIGN KEY ("invited_by") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."customer_credit_transactions" ADD CONSTRAINT "FK__customer_credit_transactions__customers" FOREIGN KEY ("customer_id") REFERENCES "core"."customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."customer_credit_transactions" ADD CONSTRAINT "FK__customer_credit_transactions__bills" FOREIGN KEY ("bill_id") REFERENCES "core"."bills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."customer_credit_transactions" ADD CONSTRAINT "FK__customer_credit_transactions__users" FOREIGN KEY ("performed_by_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."credit_approval_requests" ADD CONSTRAINT "FK__credit_approval_requests__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."credit_approval_requests" ADD CONSTRAINT "FK__credit_approval_requests__customers" FOREIGN KEY ("customer_id") REFERENCES "core"."customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."credit_approval_requests" ADD CONSTRAINT "FK__credit_approval_requests__bills" FOREIGN KEY ("bill_id") REFERENCES "core"."bills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."credit_approval_requests" ADD CONSTRAINT "FK__credit_approval_requests__requested_by__users" FOREIGN KEY ("requested_by_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."credit_approval_requests" ADD CONSTRAINT "FK__credit_approval_requests__decided_by__users" FOREIGN KEY ("decided_by_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commission_payables" ADD CONSTRAINT "FK__commission_payables__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commission_payables" ADD CONSTRAINT "FK__commission_payables__bills" FOREIGN KEY ("bill_id") REFERENCES "core"."bills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commission_payables" ADD CONSTRAINT "FK__commission_payables__users" FOREIGN KEY ("facilitator_user_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."unpublished_stock_movements" ADD CONSTRAINT "FK__unpublished_stock_movements__unpublished_stock" FOREIGN KEY ("unpublished_stock_id") REFERENCES "core"."unpublished_stock"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."unpublished_stock_movements" ADD CONSTRAINT "FK__unpublished_stock_movements__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."unpublished_stock_movements" ADD CONSTRAINT "FK__unpublished_stock_movements__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."unpublished_stock_movements" ADD CONSTRAINT "FK__unpublished_stock_movements__users" FOREIGN KEY ("performed_by_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."unpublished_stock" ADD CONSTRAINT "FK__unpublished_stock__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."unpublished_stock" ADD CONSTRAINT "FK__unpublished_stock__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."unpublished_stock" ADD CONSTRAINT "FK__unpublished_stock__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."ref_cities" ADD CONSTRAINT "FK_ref_cities_state" FOREIGN KEY ("state_id") REFERENCES "core"."ref_states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."ref_cities" ADD CONSTRAINT "FK_ref_cities_country" FOREIGN KEY ("country_id") REFERENCES "core"."ref_countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."ref_states" ADD CONSTRAINT "FK_ref_states_country" FOREIGN KEY ("country_id") REFERENCES "core"."ref_countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."vehicles" ADD CONSTRAINT "FK__vehicles__organizations" FOREIGN KEY ("company_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."vehicles" ADD CONSTRAINT "FK__vehicles__vehicle_types" FOREIGN KEY ("vehicle_type_id") REFERENCES "core"."vehicle_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."vehicles" ADD CONSTRAINT "FK__vehicles__vehicle_brands" FOREIGN KEY ("brand_id") REFERENCES "core"."vehicle_brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."vehicles" ADD CONSTRAINT "FK__vehicles__fuel_types" FOREIGN KEY ("fuel_type_id") REFERENCES "core"."fuel_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."drivers" ADD CONSTRAINT "FK__drivers__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."vehicle_driver_assignments" ADD CONSTRAINT "FK__vehicle_driver_assignments__vehicles" FOREIGN KEY ("vehicle_id") REFERENCES "core"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."vehicle_driver_assignments" ADD CONSTRAINT "FK__vehicle_driver_assignments__drivers" FOREIGN KEY ("driver_id") REFERENCES "core"."drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."vehicle_locations" ADD CONSTRAINT "FK__vehicle_locations__vehicles" FOREIGN KEY ("vehicle_id") REFERENCES "core"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."trips" ADD CONSTRAINT "FK__trips__vehicles" FOREIGN KEY ("vehicle_id") REFERENCES "core"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."trips" ADD CONSTRAINT "FK__trips__drivers" FOREIGN KEY ("driver_id") REFERENCES "core"."drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."trips" ADD CONSTRAINT "FK__trips__customers" FOREIGN KEY ("customer_id") REFERENCES "core"."customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."trip_checkpoints" ADD CONSTRAINT "FK__trip_checkpoints__trips" FOREIGN KEY ("trip_id") REFERENCES "core"."trips"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."trip_goods" ADD CONSTRAINT "FK__trip_goods__trips" FOREIGN KEY ("trip_id") REFERENCES "core"."trips"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."trip_goods" ADD CONSTRAINT "FK__trip_goods__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."trip_events" ADD CONSTRAINT "FK__trip_events__trips" FOREIGN KEY ("trip_id") REFERENCES "core"."trips"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fuel_transactions" ADD CONSTRAINT "FK__fuel_transactions__vehicles" FOREIGN KEY ("vehicle_id") REFERENCES "core"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fuel_transactions" ADD CONSTRAINT "FK__fuel_transactions__drivers" FOREIGN KEY ("driver_id") REFERENCES "core"."drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fuel_transactions" ADD CONSTRAINT "FK__fuel_transactions__trips" FOREIGN KEY ("trip_id") REFERENCES "core"."trips"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."maintenance" ADD CONSTRAINT "FK__maintenance__vehicles" FOREIGN KEY ("vehicle_id") REFERENCES "core"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."maintenance" ADD CONSTRAINT "FK__maintenance__maintenance_types" FOREIGN KEY ("maintenance_type_id") REFERENCES "core"."maintenance_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."maintenance_parts" ADD CONSTRAINT "FK__maintenance_parts__maintenance" FOREIGN KEY ("maintenance_id") REFERENCES "core"."maintenance"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."vehicle_expenses" ADD CONSTRAINT "FK__vehicle_expenses__vehicles" FOREIGN KEY ("vehicle_id") REFERENCES "core"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."vehicle_expenses" ADD CONSTRAINT "FK__vehicle_expenses__trips" FOREIGN KEY ("trip_id") REFERENCES "core"."trips"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."vehicle_documents" ADD CONSTRAINT "FK__vehicle_documents__vehicles" FOREIGN KEY ("vehicle_id") REFERENCES "core"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."driver_documents" ADD CONSTRAINT "FK__driver_documents__drivers" FOREIGN KEY ("driver_id") REFERENCES "core"."drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."vehicle_insurance" ADD CONSTRAINT "FK__vehicle_insurance__vehicles" FOREIGN KEY ("vehicle_id") REFERENCES "core"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."transportation_order_items" ADD CONSTRAINT "FK__transportation_order_items__transportation_orders" FOREIGN KEY ("order_id") REFERENCES "core"."transportation_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."transportation_order_items" ADD CONSTRAINT "FK__transportation_order_items__products" FOREIGN KEY ("product_id") REFERENCES "core"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."transportation_orders" ADD CONSTRAINT "FK__transportation_orders__customers" FOREIGN KEY ("customer_id") REFERENCES "core"."customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."gps_devices" ADD CONSTRAINT "FK__gps_devices__vehicles" FOREIGN KEY ("vehicle_id") REFERENCES "core"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."alerts" ADD CONSTRAINT "FK__alerts__vehicles" FOREIGN KEY ("vehicle_id") REFERENCES "core"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."alerts" ADD CONSTRAINT "FK__alerts__drivers" FOREIGN KEY ("driver_id") REFERENCES "core"."drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."quick_charges" ADD CONSTRAINT "FK__quick_charges__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."customer_type_rules" ADD CONSTRAINT "FK__customer_type_rules__organizations" FOREIGN KEY ("organization_id") REFERENCES "core"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."customer_type_rules" DROP CONSTRAINT "FK__customer_type_rules__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."quick_charges" DROP CONSTRAINT "FK__quick_charges__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."alerts" DROP CONSTRAINT "FK__alerts__drivers"`);
    await queryRunner.query(`ALTER TABLE "core"."alerts" DROP CONSTRAINT "FK__alerts__vehicles"`);
    await queryRunner.query(`ALTER TABLE "core"."gps_devices" DROP CONSTRAINT "FK__gps_devices__vehicles"`);
    await queryRunner.query(`ALTER TABLE "core"."transportation_orders" DROP CONSTRAINT "FK__transportation_orders__customers"`);
    await queryRunner.query(`ALTER TABLE "core"."transportation_order_items" DROP CONSTRAINT "FK__transportation_order_items__products"`);
    await queryRunner.query(`ALTER TABLE "core"."transportation_order_items" DROP CONSTRAINT "FK__transportation_order_items__transportation_orders"`);
    await queryRunner.query(`ALTER TABLE "core"."vehicle_insurance" DROP CONSTRAINT "FK__vehicle_insurance__vehicles"`);
    await queryRunner.query(`ALTER TABLE "core"."driver_documents" DROP CONSTRAINT "FK__driver_documents__drivers"`);
    await queryRunner.query(`ALTER TABLE "core"."vehicle_documents" DROP CONSTRAINT "FK__vehicle_documents__vehicles"`);
    await queryRunner.query(`ALTER TABLE "core"."vehicle_expenses" DROP CONSTRAINT "FK__vehicle_expenses__trips"`);
    await queryRunner.query(`ALTER TABLE "core"."vehicle_expenses" DROP CONSTRAINT "FK__vehicle_expenses__vehicles"`);
    await queryRunner.query(`ALTER TABLE "core"."maintenance_parts" DROP CONSTRAINT "FK__maintenance_parts__maintenance"`);
    await queryRunner.query(`ALTER TABLE "core"."maintenance" DROP CONSTRAINT "FK__maintenance__maintenance_types"`);
    await queryRunner.query(`ALTER TABLE "core"."maintenance" DROP CONSTRAINT "FK__maintenance__vehicles"`);
    await queryRunner.query(`ALTER TABLE "core"."fuel_transactions" DROP CONSTRAINT "FK__fuel_transactions__trips"`);
    await queryRunner.query(`ALTER TABLE "core"."fuel_transactions" DROP CONSTRAINT "FK__fuel_transactions__drivers"`);
    await queryRunner.query(`ALTER TABLE "core"."fuel_transactions" DROP CONSTRAINT "FK__fuel_transactions__vehicles"`);
    await queryRunner.query(`ALTER TABLE "core"."trip_events" DROP CONSTRAINT "FK__trip_events__trips"`);
    await queryRunner.query(`ALTER TABLE "core"."trip_goods" DROP CONSTRAINT "FK__trip_goods__products"`);
    await queryRunner.query(`ALTER TABLE "core"."trip_goods" DROP CONSTRAINT "FK__trip_goods__trips"`);
    await queryRunner.query(`ALTER TABLE "core"."trip_checkpoints" DROP CONSTRAINT "FK__trip_checkpoints__trips"`);
    await queryRunner.query(`ALTER TABLE "core"."trips" DROP CONSTRAINT "FK__trips__customers"`);
    await queryRunner.query(`ALTER TABLE "core"."trips" DROP CONSTRAINT "FK__trips__drivers"`);
    await queryRunner.query(`ALTER TABLE "core"."trips" DROP CONSTRAINT "FK__trips__vehicles"`);
    await queryRunner.query(`ALTER TABLE "core"."vehicle_locations" DROP CONSTRAINT "FK__vehicle_locations__vehicles"`);
    await queryRunner.query(`ALTER TABLE "core"."vehicle_driver_assignments" DROP CONSTRAINT "FK__vehicle_driver_assignments__drivers"`);
    await queryRunner.query(`ALTER TABLE "core"."vehicle_driver_assignments" DROP CONSTRAINT "FK__vehicle_driver_assignments__vehicles"`);
    await queryRunner.query(`ALTER TABLE "core"."drivers" DROP CONSTRAINT "FK__drivers__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."vehicles" DROP CONSTRAINT "FK__vehicles__fuel_types"`);
    await queryRunner.query(`ALTER TABLE "core"."vehicles" DROP CONSTRAINT "FK__vehicles__vehicle_brands"`);
    await queryRunner.query(`ALTER TABLE "core"."vehicles" DROP CONSTRAINT "FK__vehicles__vehicle_types"`);
    await queryRunner.query(`ALTER TABLE "core"."vehicles" DROP CONSTRAINT "FK__vehicles__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."ref_states" DROP CONSTRAINT "FK_ref_states_country"`);
    await queryRunner.query(`ALTER TABLE "core"."ref_cities" DROP CONSTRAINT "FK_ref_cities_country"`);
    await queryRunner.query(`ALTER TABLE "core"."ref_cities" DROP CONSTRAINT "FK_ref_cities_state"`);
    await queryRunner.query(`ALTER TABLE "core"."unpublished_stock" DROP CONSTRAINT "FK__unpublished_stock__products"`);
    await queryRunner.query(`ALTER TABLE "core"."unpublished_stock" DROP CONSTRAINT "FK__unpublished_stock__locations"`);
    await queryRunner.query(`ALTER TABLE "core"."unpublished_stock" DROP CONSTRAINT "FK__unpublished_stock__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."unpublished_stock_movements" DROP CONSTRAINT "FK__unpublished_stock_movements__users"`);
    await queryRunner.query(`ALTER TABLE "core"."unpublished_stock_movements" DROP CONSTRAINT "FK__unpublished_stock_movements__products"`);
    await queryRunner.query(`ALTER TABLE "core"."unpublished_stock_movements" DROP CONSTRAINT "FK__unpublished_stock_movements__locations"`);
    await queryRunner.query(`ALTER TABLE "core"."unpublished_stock_movements" DROP CONSTRAINT "FK__unpublished_stock_movements__unpublished_stock"`);
    await queryRunner.query(`ALTER TABLE "core"."commission_payables" DROP CONSTRAINT "FK__commission_payables__users"`);
    await queryRunner.query(`ALTER TABLE "core"."commission_payables" DROP CONSTRAINT "FK__commission_payables__bills"`);
    await queryRunner.query(`ALTER TABLE "core"."commission_payables" DROP CONSTRAINT "FK__commission_payables__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."credit_approval_requests" DROP CONSTRAINT "FK__credit_approval_requests__decided_by__users"`);
    await queryRunner.query(`ALTER TABLE "core"."credit_approval_requests" DROP CONSTRAINT "FK__credit_approval_requests__requested_by__users"`);
    await queryRunner.query(`ALTER TABLE "core"."credit_approval_requests" DROP CONSTRAINT "FK__credit_approval_requests__bills"`);
    await queryRunner.query(`ALTER TABLE "core"."credit_approval_requests" DROP CONSTRAINT "FK__credit_approval_requests__customers"`);
    await queryRunner.query(`ALTER TABLE "core"."credit_approval_requests" DROP CONSTRAINT "FK__credit_approval_requests__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."customer_credit_transactions" DROP CONSTRAINT "FK__customer_credit_transactions__users"`);
    await queryRunner.query(`ALTER TABLE "core"."customer_credit_transactions" DROP CONSTRAINT "FK__customer_credit_transactions__bills"`);
    await queryRunner.query(`ALTER TABLE "core"."customer_credit_transactions" DROP CONSTRAINT "FK__customer_credit_transactions__customers"`);
    await queryRunner.query(`ALTER TABLE "core"."org_members" DROP CONSTRAINT "FK__org_members__invited_by"`);
    await queryRunner.query(`ALTER TABLE "core"."org_members" DROP CONSTRAINT "FK__org_members__roles"`);
    await queryRunner.query(`ALTER TABLE "core"."org_members" DROP CONSTRAINT "FK__org_members__users"`);
    await queryRunner.query(`ALTER TABLE "core"."org_members" DROP CONSTRAINT "FK__org_members__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."role_permissions" DROP CONSTRAINT "FK__role_permissions__permissions"`);
    await queryRunner.query(`ALTER TABLE "core"."role_permissions" DROP CONSTRAINT "FK__role_permissions__roles"`);
    await queryRunner.query(`ALTER TABLE "core"."user_addresses" DROP CONSTRAINT "FK__user_addresses__users"`);
    await queryRunner.query(`ALTER TABLE "core"."user_profiles" DROP CONSTRAINT "FK__user_profiles__users"`);
    await queryRunner.query(`ALTER TABLE "core"."product_variants" DROP CONSTRAINT "FK__product_variants__products"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_transfer_requests" DROP CONSTRAINT "FK__stock_transfer_requests__stock_transfers"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_transfer_requests" DROP CONSTRAINT "FK__stock_transfer_requests__products"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_transfer_requests" DROP CONSTRAINT "FK__stock_transfer_requests__accepted_users"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_transfer_requests" DROP CONSTRAINT "FK__stock_transfer_requests__requesting_users"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_transfer_requests" DROP CONSTRAINT "FK__stock_transfer_requests__accepted_locations"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_transfer_requests" DROP CONSTRAINT "FK__stock_transfer_requests__requesting_locations"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_transfer_requests" DROP CONSTRAINT "FK__stock_transfer_requests__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_transfers" DROP CONSTRAINT "FK__stock_transfers__to_locations"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_transfers" DROP CONSTRAINT "FK__stock_transfers__from_locations"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_transfers" DROP CONSTRAINT "FK__stock_transfers__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_transfer_items" DROP CONSTRAINT "FK__stock_transfer_items__products"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_transfer_items" DROP CONSTRAINT "FK__stock_transfer_items__stock_transfers"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_entries" DROP CONSTRAINT "FK__stock_entries__suppliers"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_entries" DROP CONSTRAINT "FK__stock_entries__products"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_entries" DROP CONSTRAINT "FK__stock_entries__locations"`);
    await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" DROP CONSTRAINT "FK__report_generation_logs__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."org_activity_logs" DROP CONSTRAINT "FK__org_activity_logs__actor"`);
    await queryRunner.query(`ALTER TABLE "core"."org_activity_logs" DROP CONSTRAINT "FK__org_activity_logs__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."notifications" DROP CONSTRAINT "FK__notifications__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."notifications" DROP CONSTRAINT "FK__notifications__users"`);
    await queryRunner.query(`ALTER TABLE "core"."item_returns" DROP CONSTRAINT "FK__item_returns__suppliers"`);
    await queryRunner.query(`ALTER TABLE "core"."item_returns" DROP CONSTRAINT "FK__item_returns__orders"`);
    await queryRunner.query(`ALTER TABLE "core"."item_returns" DROP CONSTRAINT "FK__item_returns__locations"`);
    await queryRunner.query(`ALTER TABLE "core"."return_items" DROP CONSTRAINT "FK__return_items__products"`);
    await queryRunner.query(`ALTER TABLE "core"."return_items" DROP CONSTRAINT "FK__return_items__item_returns"`);
    await queryRunner.query(`ALTER TABLE "core"."expenses" DROP CONSTRAINT "FK__expenses__locations"`);
    await queryRunner.query(`ALTER TABLE "core"."expenses" DROP CONSTRAINT "FK__expenses__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."payment_transactions" DROP CONSTRAINT "FK__payment_transactions__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."bills" DROP CONSTRAINT "FK__bills__users"`);
    await queryRunner.query(`ALTER TABLE "core"."bills" DROP CONSTRAINT "FK__bills__customers"`);
    await queryRunner.query(`ALTER TABLE "core"."bills" DROP CONSTRAINT "FK__bills__locations"`);
    await queryRunner.query(`ALTER TABLE "core"."bills" DROP CONSTRAINT "FK__bills__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."bill_items" DROP CONSTRAINT "FK__bill_items__products"`);
    await queryRunner.query(`ALTER TABLE "core"."bill_items" DROP CONSTRAINT "FK__bill_items__bills"`);
    await queryRunner.query(`ALTER TABLE "core"."invoices" DROP CONSTRAINT "FK__invoices__orders"`);
    await queryRunner.query(`ALTER TABLE "core"."orders" DROP CONSTRAINT "FK__orders__customers"`);
    await queryRunner.query(`ALTER TABLE "core"."orders" DROP CONSTRAINT "FK__orders__locations"`);
    await queryRunner.query(`ALTER TABLE "core"."order_items" DROP CONSTRAINT "FK__order_items__products"`);
    await queryRunner.query(`ALTER TABLE "core"."order_items" DROP CONSTRAINT "FK__order_items__orders"`);
    await queryRunner.query(`ALTER TABLE "core"."discount_coupons" DROP CONSTRAINT "FK__discount_coupons__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."customers" DROP CONSTRAINT "FK__customers__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."product_logs" DROP CONSTRAINT "FK__product_logs__users"`);
    await queryRunner.query(`ALTER TABLE "core"."product_logs" DROP CONSTRAINT "FK__product_logs__products"`);
    await queryRunner.query(`ALTER TABLE "core"."locations" DROP CONSTRAINT "FK__locations__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."users" DROP CONSTRAINT "FK__users__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."activity_logs" DROP CONSTRAINT "FK__activity_logs__locations"`);
    await queryRunner.query(`ALTER TABLE "core"."activity_logs" DROP CONSTRAINT "FK__activity_logs__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."activity_logs" DROP CONSTRAINT "FK__activity_logs__users"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_movements" DROP CONSTRAINT "FK__stock_movements__users"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_movements" DROP CONSTRAINT "FK__stock_movements__products"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_movements" DROP CONSTRAINT "FK__stock_movements__locations"`);
    await queryRunner.query(`ALTER TABLE "core"."stock_movements" DROP CONSTRAINT "FK__stock_movements__inventory"`);
    await queryRunner.query(`ALTER TABLE "core"."products" DROP CONSTRAINT "FK__products__users"`);
    await queryRunner.query(`ALTER TABLE "core"."products" DROP CONSTRAINT "FK__products__categories"`);
    await queryRunner.query(`ALTER TABLE "core"."products" DROP CONSTRAINT "FK__products__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."product_suppliers" DROP CONSTRAINT "FK__product_suppliers__suppliers"`);
    await queryRunner.query(`ALTER TABLE "core"."product_suppliers" DROP CONSTRAINT "FK__product_suppliers__products"`);
    await queryRunner.query(`ALTER TABLE "core"."product_images" DROP CONSTRAINT "FK__product_images__users"`);
    await queryRunner.query(`ALTER TABLE "core"."product_images" DROP CONSTRAINT "FK__product_images__products"`);
    await queryRunner.query(`ALTER TABLE "core"."purchase_items" DROP CONSTRAINT "FK__purchase_items__products"`);
    await queryRunner.query(`ALTER TABLE "core"."purchase_items" DROP CONSTRAINT "FK__purchase_items__purchase_orders"`);
    await queryRunner.query(`ALTER TABLE "core"."purchase_orders" DROP CONSTRAINT "FK__purchase_orders__users"`);
    await queryRunner.query(`ALTER TABLE "core"."purchase_orders" DROP CONSTRAINT "FK__purchase_orders__suppliers"`);
    await queryRunner.query(`ALTER TABLE "core"."purchase_orders" DROP CONSTRAINT "FK__purchase_orders__locations"`);
    await queryRunner.query(`ALTER TABLE "core"."purchase_orders" DROP CONSTRAINT "FK__purchase_orders__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."suppliers" DROP CONSTRAINT "FK__suppliers__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."inventory" DROP CONSTRAINT "FK__inventory__products"`);
    await queryRunner.query(`ALTER TABLE "core"."inventory" DROP CONSTRAINT "FK__inventory__locations"`);
    await queryRunner.query(`ALTER TABLE "core"."inventory" DROP CONSTRAINT "FK__inventory__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."categories" DROP CONSTRAINT "FK__categories__parent"`);
    await queryRunner.query(`ALTER TABLE "core"."categories" DROP CONSTRAINT "FK__categories__organizations"`);
    await queryRunner.query(`ALTER TABLE "core"."user_roles" DROP CONSTRAINT "FK__user_roles__locations"`);
    await queryRunner.query(`ALTER TABLE "core"."user_roles" DROP CONSTRAINT "FK__user_roles__roles"`);
    await queryRunner.query(`ALTER TABLE "core"."user_roles" DROP CONSTRAINT "FK__user_roles__users"`);
    await queryRunner.query(`DROP TABLE "core"."customer_type_rules"`);
    await queryRunner.query(`DROP TABLE "core"."quick_charges"`);
    await queryRunner.query(`DROP TABLE "core"."email_templates"`);
    await queryRunner.query(`DROP TABLE "core"."alerts"`);
    await queryRunner.query(`DROP TYPE "core"."alerts_severity_enum"`);
    await queryRunner.query(`DROP TYPE "core"."alerts_alert_type_enum"`);
    await queryRunner.query(`DROP TABLE "core"."gps_devices"`);
    await queryRunner.query(`DROP TABLE "core"."transportation_orders"`);
    await queryRunner.query(`DROP TYPE "core"."transportation_orders_priority_enum"`);
    await queryRunner.query(`DROP TYPE "core"."transportation_orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "core"."transportation_order_items"`);
    await queryRunner.query(`DROP TABLE "core"."vehicle_insurance"`);
    await queryRunner.query(`DROP TABLE "core"."driver_documents"`);
    await queryRunner.query(`DROP TYPE "core"."driver_documents_document_type_enum"`);
    await queryRunner.query(`DROP TABLE "core"."vehicle_documents"`);
    await queryRunner.query(`DROP TYPE "core"."vehicle_documents_document_type_enum"`);
    await queryRunner.query(`DROP TABLE "core"."vehicle_expenses"`);
    await queryRunner.query(`DROP TYPE "core"."vehicle_expenses_expense_type_enum"`);
    await queryRunner.query(`DROP TABLE "core"."maintenance_parts"`);
    await queryRunner.query(`DROP TABLE "core"."maintenance"`);
    await queryRunner.query(`DROP TYPE "core"."maintenance_status_enum"`);
    await queryRunner.query(`DROP TABLE "core"."maintenance_types"`);
    await queryRunner.query(`DROP TABLE "core"."fuel_transactions"`);
    await queryRunner.query(`DROP TABLE "core"."trip_events"`);
    await queryRunner.query(`DROP TYPE "core"."trip_events_event_type_enum"`);
    await queryRunner.query(`DROP TABLE "core"."trip_goods"`);
    await queryRunner.query(`DROP TABLE "core"."trip_checkpoints"`);
    await queryRunner.query(`DROP TABLE "core"."trips"`);
    await queryRunner.query(`DROP TYPE "core"."trips_trip_status_enum"`);
    await queryRunner.query(`DROP TABLE "core"."vehicle_locations"`);
    await queryRunner.query(`DROP TABLE "core"."vehicle_driver_assignments"`);
    await queryRunner.query(`DROP TABLE "core"."drivers"`);
    await queryRunner.query(`DROP TYPE "core"."drivers_status_enum"`);
    await queryRunner.query(`DROP TABLE "core"."vehicles"`);
    await queryRunner.query(`DROP TYPE "core"."vehicles_status_enum"`);
    await queryRunner.query(`DROP TABLE "core"."fuel_types"`);
    await queryRunner.query(`DROP TABLE "core"."vehicle_brands"`);
    await queryRunner.query(`DROP TABLE "core"."vehicle_types"`);
    await queryRunner.query(`DROP TABLE "core"."page_access_configs"`);
    await queryRunner.query(`DROP TABLE "core"."ref_languages"`);
    await queryRunner.query(`DROP TABLE "core"."ref_currencies"`);
    await queryRunner.query(`DROP TABLE "core"."ref_countries"`);
    await queryRunner.query(`DROP TABLE "core"."ref_states"`);
    await queryRunner.query(`DROP TABLE "core"."ref_cities"`);
    await queryRunner.query(`DROP TABLE "core"."unpublished_stock"`);
    await queryRunner.query(`DROP TABLE "core"."unpublished_stock_movements"`);
    await queryRunner.query(`DROP TYPE "core"."unpublished_stock_movements_movement_type_enum"`);
    await queryRunner.query(`DROP TABLE "core"."commission_payables"`);
    await queryRunner.query(`DROP TYPE "core"."commission_payables_status_enum"`);
    await queryRunner.query(`DROP TABLE "core"."credit_approval_requests"`);
    await queryRunner.query(`DROP TYPE "core"."credit_approval_requests_status_enum"`);
    await queryRunner.query(`DROP TABLE "core"."customer_credit_transactions"`);
    await queryRunner.query(`DROP TYPE "core"."customer_credit_transactions_type_enum"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_986db88b0e82a9189921841199"`);
    await queryRunner.query(`DROP TABLE "core"."org_members"`);
    await queryRunner.query(`DROP TABLE "core"."platform_configurations"`);
    await queryRunner.query(`DROP TABLE "core"."platforms"`);
    await queryRunner.query(`DROP TABLE "core"."role_permissions"`);
    await queryRunner.query(`DROP TABLE "core"."permissions"`);
    await queryRunner.query(`DROP TABLE "core"."user_addresses"`);
    await queryRunner.query(`DROP TABLE "core"."user_profiles"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_ceaa413b9fe3dbfd6e889dc5a7"`);
    await queryRunner.query(`DROP TABLE "core"."product_variants"`);
    await queryRunner.query(`DROP TABLE "core"."stock_transfer_requests"`);
    await queryRunner.query(`DROP TABLE "core"."stock_transfers"`);
    await queryRunner.query(`DROP TABLE "core"."stock_transfer_items"`);
    await queryRunner.query(`DROP TABLE "core"."stock_entries"`);
    await queryRunner.query(`DROP TABLE "core"."report_generation_logs"`);
    await queryRunner.query(`DROP TABLE "core"."org_activity_logs"`);
    await queryRunner.query(`DROP TABLE "core"."notifications"`);
    await queryRunner.query(`DROP TABLE "core"."item_returns"`);
    await queryRunner.query(`DROP TABLE "core"."return_items"`);
    await queryRunner.query(`DROP TABLE "core"."expenses"`);
    await queryRunner.query(`DROP TABLE "core"."payment_transactions"`);
    await queryRunner.query(`DROP INDEX "core"."IX__bills__org_location_status"`);
    await queryRunner.query(`DROP TABLE "core"."bills"`);
    await queryRunner.query(`DROP TYPE "core"."bills_payment_timing_enum"`);
    await queryRunner.query(`DROP TYPE "core"."bills_customer_type_enum"`);
    await queryRunner.query(`DROP TYPE "core"."bills_sale_type_enum"`);
    await queryRunner.query(`DROP TYPE "core"."bills_payment_method_enum"`);
    await queryRunner.query(`DROP TYPE "core"."bills_status_enum"`);
    await queryRunner.query(`DROP TABLE "core"."bill_items"`);
    await queryRunner.query(`DROP TABLE "core"."invoices"`);
    await queryRunner.query(`DROP TABLE "core"."orders"`);
    await queryRunner.query(`DROP TABLE "core"."order_items"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_7e3ce2a9666b36fb7d96d975ba"`);
    await queryRunner.query(`DROP TABLE "core"."discount_coupons"`);
    await queryRunner.query(`DROP TABLE "core"."customers"`);
    await queryRunner.query(`DROP TYPE "core"."customers_customer_type_enum"`);
    await queryRunner.query(`DROP INDEX "core"."IDX__product_logs__product_created"`);
    await queryRunner.query(`DROP INDEX "core"."IDX__product_logs__org_created"`);
    await queryRunner.query(`DROP INDEX "core"."IDX__product_logs__inventory_created"`);
    await queryRunner.query(`DROP TABLE "core"."product_logs"`);
    await queryRunner.query(`DROP TYPE "core"."product_logs_action_enum"`);
    await queryRunner.query(`DROP TABLE "core"."locations"`);
    await queryRunner.query(`DROP TYPE "core"."locations_type_enum"`);
    await queryRunner.query(`DROP TABLE "core"."organizations"`);
    await queryRunner.query(`DROP TABLE "core"."users"`);
    await queryRunner.query(`DROP TABLE "core"."activity_logs"`);
    await queryRunner.query(`DROP TYPE "core"."activity_logs_action_enum"`);
    await queryRunner.query(`DROP TABLE "core"."stock_movements"`);
    await queryRunner.query(`DROP TYPE "core"."stock_movements_movement_type_enum"`);
    await queryRunner.query(`DROP TABLE "core"."products"`);
    await queryRunner.query(`DROP TYPE "core"."products_unit_enum"`);
    await queryRunner.query(`DROP INDEX "core"."UQ__product_suppliers__product_supplier"`);
    await queryRunner.query(`DROP TABLE "core"."product_suppliers"`);
    await queryRunner.query(`DROP TABLE "core"."product_images"`);
    await queryRunner.query(`DROP TABLE "core"."purchase_items"`);
    await queryRunner.query(`DROP TABLE "core"."purchase_orders"`);
    await queryRunner.query(`DROP TYPE "core"."purchase_orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "core"."suppliers"`);
    await queryRunner.query(`DROP TABLE "core"."inventory"`);
    await queryRunner.query(`DROP TABLE "core"."categories"`);
    await queryRunner.query(`DROP TABLE "core"."user_roles"`);
    await queryRunner.query(`DROP TABLE "core"."roles"`);
    await queryRunner.query(`DROP TYPE "core"."roles_name_enum"`);
    await queryRunner.query(`DROP SCHEMA "core"`);
    await queryRunner.query(`DROP TABLE "public"."seeds"`);
  }
}
