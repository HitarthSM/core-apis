import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1788028557892 implements MigrationInterface {
    name = 'Migration1788028557892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "core"."unpublished_stock_movements_movement_type_enum" RENAME TO "unpublished_stock_movements_movement_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "core"."unpublished_stock_movements_movement_type_enum" AS ENUM('stock_in', 'stock_out', 'transfer_out')`);
        await queryRunner.query(`ALTER TABLE "core"."unpublished_stock_movements" ALTER COLUMN "movement_type" TYPE "core"."unpublished_stock_movements_movement_type_enum" USING "movement_type"::"text"::"core"."unpublished_stock_movements_movement_type_enum"`);
        await queryRunner.query(`DROP TYPE "core"."unpublished_stock_movements_movement_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "core"."unpublished_stock_movements_movement_type_enum_old" AS ENUM('stock_in', 'transfer_out')`);
        await queryRunner.query(`ALTER TABLE "core"."unpublished_stock_movements" ALTER COLUMN "movement_type" TYPE "core"."unpublished_stock_movements_movement_type_enum_old" USING "movement_type"::"text"::"core"."unpublished_stock_movements_movement_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "core"."unpublished_stock_movements_movement_type_enum"`);
        await queryRunner.query(`ALTER TYPE "core"."unpublished_stock_movements_movement_type_enum_old" RENAME TO "unpublished_stock_movements_movement_type_enum"`);
    }

}
