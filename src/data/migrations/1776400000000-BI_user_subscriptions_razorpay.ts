import { MigrationInterface, QueryRunner } from 'typeorm';

export class BI1776400000000UserSubscriptionsRazorpay1776400000000 implements MigrationInterface {
  name = 'BI1776400000000UserSubscriptionsRazorpay1776400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription_plans" ADD "razorpay_plan_id" character varying(64)`,
    );
    await queryRunner.query(`
      CREATE TABLE "user_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "subscription_plan_id" uuid NOT NULL,
        "razorpay_subscription_id" character varying(64) NOT NULL,
        "status" character varying(32) NOT NULL,
        "current_period_start" TIMESTAMP WITH TIME ZONE,
        "current_period_end" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_subscriptions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_subscriptions_razorpay" UNIQUE ("razorpay_subscription_id"),
        CONSTRAINT "FK_user_subscriptions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_user_subscriptions_plan" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_user_subscriptions_user_id" ON "user_subscriptions" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_user_subscriptions_user_id"`);
    await queryRunner.query(`DROP TABLE "user_subscriptions"`);
    await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "razorpay_plan_id"`);
  }
}
