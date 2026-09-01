import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1787630908150 implements MigrationInterface {
    name = 'Migration1787630908150'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."purchase_orders" DROP CONSTRAINT "FK__purchase_orders__locations"`);
        await queryRunner.query(`CREATE TABLE "core"."purchase_item_allocations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "purchase_order_id" uuid NOT NULL, "purchase_item_id" uuid NOT NULL, "location_id" uuid NOT NULL, "quantity" numeric(18,4) NOT NULL, "performed_by_id" uuid, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_purchase_item_allocations" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_orders" DROP COLUMN "location_id"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_items" ADD "quantity_allocated" numeric(18,4) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TYPE "core"."purchase_orders_status_enum" RENAME TO "purchase_orders_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "core"."purchase_orders_status_enum" AS ENUM('draft', 'ordered', 'partially_received', 'received', 'partially_allocated', 'allocated', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_orders" ALTER COLUMN "status" TYPE "core"."purchase_orders_status_enum" USING "status"::"text"::"core"."purchase_orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_orders" ALTER COLUMN "status" SET DEFAULT 'draft'`);
        await queryRunner.query(`DROP TYPE "core"."purchase_orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_item_allocations" ADD CONSTRAINT "FK__purchase_item_allocations__purchase_orders" FOREIGN KEY ("purchase_order_id") REFERENCES "core"."purchase_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_item_allocations" ADD CONSTRAINT "FK__purchase_item_allocations__purchase_items" FOREIGN KEY ("purchase_item_id") REFERENCES "core"."purchase_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_item_allocations" ADD CONSTRAINT "FK__purchase_item_allocations__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_item_allocations" ADD CONSTRAINT "FK__purchase_item_allocations__users" FOREIGN KEY ("performed_by_id") REFERENCES "core"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."purchase_item_allocations" DROP CONSTRAINT "FK__purchase_item_allocations__users"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_item_allocations" DROP CONSTRAINT "FK__purchase_item_allocations__locations"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_item_allocations" DROP CONSTRAINT "FK__purchase_item_allocations__purchase_items"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_item_allocations" DROP CONSTRAINT "FK__purchase_item_allocations__purchase_orders"`);
        await queryRunner.query(`CREATE TYPE "core"."purchase_orders_status_enum_old" AS ENUM('draft', 'ordered', 'partially_received', 'received', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_orders" ALTER COLUMN "status" TYPE "core"."purchase_orders_status_enum_old" USING "status"::"text"::"core"."purchase_orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_orders" ALTER COLUMN "status" SET DEFAULT 'draft'`);
        await queryRunner.query(`DROP TYPE "core"."purchase_orders_status_enum"`);
        await queryRunner.query(`ALTER TYPE "core"."purchase_orders_status_enum_old" RENAME TO "purchase_orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_items" DROP COLUMN "quantity_allocated"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_orders" ADD "location_id" uuid NOT NULL`);
        await queryRunner.query(`DROP TABLE "core"."purchase_item_allocations"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_orders" ADD CONSTRAINT "FK__purchase_orders__locations" FOREIGN KEY ("location_id") REFERENCES "core"."locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
