import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1787681135660 implements MigrationInterface {
    name = 'Migration1787681135660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "core"."customers" DROP COLUMN "shop_name"`);
        // await queryRunner.query(`ALTER TABLE "core"."customers" DROP COLUMN "address"`);
        // await queryRunner.query(`ALTER TABLE "core"."customers" DROP COLUMN "pin_code"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_items" ADD "pack_quantity" numeric(18,4)`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_items" ADD "pack_size_snapshot" integer`);
        await queryRunner.query(`ALTER TABLE "core"."products" ADD "manufacturer" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "core"."products" ADD "pack_size" integer`);
        await queryRunner.query(`ALTER TABLE "core"."order_items" ADD "pack_quantity" numeric(18,4)`);
        await queryRunner.query(`ALTER TABLE "core"."order_items" ADD "pack_size_snapshot" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."order_items" DROP COLUMN "pack_size_snapshot"`);
        await queryRunner.query(`ALTER TABLE "core"."order_items" DROP COLUMN "pack_quantity"`);
        await queryRunner.query(`ALTER TABLE "core"."products" DROP COLUMN "pack_size"`);
        await queryRunner.query(`ALTER TABLE "core"."products" DROP COLUMN "manufacturer"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_items" DROP COLUMN "pack_size_snapshot"`);
        await queryRunner.query(`ALTER TABLE "core"."purchase_items" DROP COLUMN "pack_quantity"`);
        // await queryRunner.query(`ALTER TABLE "core"."customers" ADD "pin_code" character varying(20)`);
        // await queryRunner.query(`ALTER TABLE "core"."customers" ADD "address" character varying(500)`);
        // await queryRunner.query(`ALTER TABLE "core"."customers" ADD "shop_name" character varying(255)`);
    }

}
