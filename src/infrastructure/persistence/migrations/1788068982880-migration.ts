import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1788068982880 implements MigrationInterface {
    name = 'Migration1788068982880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "core"."trip_stops_status_enum" AS ENUM('pending', 'in_transit', 'delivered', 'failed')`);
        await queryRunner.query(`CREATE TABLE "core"."trip_stops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trip_id" uuid NOT NULL, "order_id" uuid NOT NULL, "sequence" integer NOT NULL, "status" "core"."trip_stops_status_enum" NOT NULL DEFAULT 'pending', "otp_code" character varying(60), "otp_expires_at" TIMESTAMP, "otp_verified_at" TIMESTAMP, "delivered_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_trip_stops" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "core"."user_device_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token" character varying(500) NOT NULL, "platform" character varying(10) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ__user_device_tokens__user_token" UNIQUE ("user_id", "token"), CONSTRAINT "PK_user_device_tokens" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "core"."orders" ADD "claimed_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "core"."orders" ADD "claimed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "core"."orders" ADD "packed_by_user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "core"."orders" ADD "packed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TYPE "core"."transportation_orders_status_enum" RENAME TO "transportation_orders_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "core"."transportation_orders_status_enum" AS ENUM('pending', 'confirmed', 'packed', 'in_transit', 'delivered', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "core"."transportation_orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "core"."transportation_orders" ALTER COLUMN "status" TYPE "core"."transportation_orders_status_enum" USING "status"::"text"::"core"."transportation_orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "core"."transportation_orders" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "core"."transportation_orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "core"."trip_stops" ADD CONSTRAINT "FK__trip_stops__trips" FOREIGN KEY ("trip_id") REFERENCES "core"."trips"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "core"."trip_stops" ADD CONSTRAINT "FK__trip_stops__orders" FOREIGN KEY ("order_id") REFERENCES "core"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."trip_stops" DROP CONSTRAINT "FK__trip_stops__orders"`);
        await queryRunner.query(`ALTER TABLE "core"."trip_stops" DROP CONSTRAINT "FK__trip_stops__trips"`);
        await queryRunner.query(`CREATE TYPE "core"."transportation_orders_status_enum_old" AS ENUM('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "core"."transportation_orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "core"."transportation_orders" ALTER COLUMN "status" TYPE "core"."transportation_orders_status_enum_old" USING "status"::"text"::"core"."transportation_orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "core"."transportation_orders" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "core"."transportation_orders_status_enum"`);
        await queryRunner.query(`ALTER TYPE "core"."transportation_orders_status_enum_old" RENAME TO "transportation_orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "core"."orders" DROP COLUMN "packed_at"`);
        await queryRunner.query(`ALTER TABLE "core"."orders" DROP COLUMN "packed_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "core"."orders" DROP COLUMN "claimed_at"`);
        await queryRunner.query(`ALTER TABLE "core"."orders" DROP COLUMN "claimed_by_user_id"`);
        await queryRunner.query(`DROP TABLE "core"."user_device_tokens"`);
        await queryRunner.query(`DROP TABLE "core"."trip_stops"`);
        await queryRunner.query(`DROP TYPE "core"."trip_stops_status_enum"`);
    }

}
