import { MigrationInterface, QueryRunner } from "typeorm";

export class BISubscriptipn1774681136263 implements MigrationInterface {
    name = 'BISubscriptipn1774681136263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "max_active_cases"`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "unlimited_queries"`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "priority_support"`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "emergency_support"`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "onsite_assistance_possible"`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "response_sla_hours"`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "features" character varying NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."subscription_plans_billing_cycle_enum" RENAME TO "subscription_plans_billing_cycle_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."subscription_plans_billing_cycle_enum" AS ENUM('monthly', 'yearly')`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" ALTER COLUMN "billing_cycle" TYPE "public"."subscription_plans_billing_cycle_enum" USING "billing_cycle"::"text"::"public"."subscription_plans_billing_cycle_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscription_plans_billing_cycle_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."subscription_plans_billing_cycle_enum_old" AS ENUM('monthly', 'quarterly', 'yearly')`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" ALTER COLUMN "billing_cycle" TYPE "public"."subscription_plans_billing_cycle_enum_old" USING "billing_cycle"::"text"::"public"."subscription_plans_billing_cycle_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."subscription_plans_billing_cycle_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."subscription_plans_billing_cycle_enum_old" RENAME TO "subscription_plans_billing_cycle_enum"`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "features"`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "response_sla_hours" integer`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "onsite_assistance_possible" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "emergency_support" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "priority_support" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "unlimited_queries" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "max_active_cases" integer`);
    }

}
