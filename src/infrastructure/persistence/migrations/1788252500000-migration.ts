import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1788252500000 implements MigrationInterface {
  name = 'Migration1788252500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."customers" ADD "address" character varying(500)`);
    await queryRunner.query(`ALTER TABLE "core"."customers" ADD "pin_code" character varying(20)`);
    await queryRunner.query(`ALTER TABLE "core"."customers" ADD "shop_name" character varying(255)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."customers" DROP COLUMN "shop_name"`);
    await queryRunner.query(`ALTER TABLE "core"."customers" DROP COLUMN "pin_code"`);
    await queryRunner.query(`ALTER TABLE "core"."customers" DROP COLUMN "address"`);
  }
}
