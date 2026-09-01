import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1788081078461 implements MigrationInterface {
    name = 'Migration1788081078461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."bills" ADD "source_order_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."bills" DROP COLUMN "source_order_id"`);
    }

}
