import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1787392406941 implements MigrationInterface {
    name = 'Migration1787392406941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" ADD "report_period" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" ADD "report_name" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" ADD "from_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" ADD "to_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" ADD "location_id" uuid`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" ADD "generated_by_id" uuid`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" ADD "report_data" jsonb`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" DROP COLUMN "report_data"`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" DROP COLUMN "generated_by_id"`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" DROP COLUMN "location_id"`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" DROP COLUMN "to_date"`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" DROP COLUMN "from_date"`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" DROP COLUMN "report_name"`);
        await queryRunner.query(`ALTER TABLE "core"."report_generation_logs" DROP COLUMN "report_period"`);
    }

}
