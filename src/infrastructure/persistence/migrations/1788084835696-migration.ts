import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1788084835696 implements MigrationInterface {
    name = 'Migration1788084835696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "core"."roles_name_enum" RENAME TO "roles_name_enum_old"`);
        await queryRunner.query(`CREATE TYPE "core"."roles_name_enum" AS ENUM('super_admin', 'org_admin', 'org_manager', 'store_manager', 'store_staff', 'picker', 'driver')`);
        await queryRunner.query(`ALTER TABLE "core"."roles" ALTER COLUMN "name" TYPE "core"."roles_name_enum" USING "name"::"text"::"core"."roles_name_enum"`);
        await queryRunner.query(`DROP TYPE "core"."roles_name_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "core"."roles_name_enum_old" AS ENUM('super_admin', 'org_admin', 'org_manager', 'store_manager', 'store_staff')`);
        await queryRunner.query(`ALTER TABLE "core"."roles" ALTER COLUMN "name" TYPE "core"."roles_name_enum_old" USING "name"::"text"::"core"."roles_name_enum_old"`);
        await queryRunner.query(`DROP TYPE "core"."roles_name_enum"`);
        await queryRunner.query(`ALTER TYPE "core"."roles_name_enum_old" RENAME TO "roles_name_enum"`);
    }

}
