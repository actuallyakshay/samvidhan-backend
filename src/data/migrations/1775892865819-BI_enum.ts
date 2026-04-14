import { MigrationInterface, QueryRunner } from 'typeorm';

export class BIEnum1775892865819 implements MigrationInterface {
  name = 'BIEnum1775892865819';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_5480495730c8ba4558a33f6962"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_af1e8292e6d5dd63c5a1f5a364"`);
    await queryRunner.query(
      `ALTER TYPE "public"."cases_status_enum" RENAME TO "cases_status_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cases_status_enum" AS ENUM('new', 'under_review', 'lawyer_assigned', 'closed', 'rejected')`
    );
    await queryRunner.query(`ALTER TABLE "cases" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "cases" ALTER COLUMN "status" TYPE "public"."cases_status_enum" USING "status"::"text"::"public"."cases_status_enum"`
    );
    await queryRunner.query(`ALTER TABLE "cases" ALTER COLUMN "status" SET DEFAULT 'new'`);
    await queryRunner.query(`DROP TYPE "public"."cases_status_enum_old"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_5480495730c8ba4558a33f6962" ON "cases" ("assigned_lawyer_id", "status", "created_at") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af1e8292e6d5dd63c5a1f5a364" ON "cases" ("user_id", "status", "created_at") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_af1e8292e6d5dd63c5a1f5a364"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5480495730c8ba4558a33f6962"`);
    await queryRunner.query(
      `CREATE TYPE "public"."cases_status_enum_old" AS ENUM('new', 'under_review', 'lawyer_assigned', 'in_consultation', 'waiting_for_user', 'resolved', 'closed', 'rejected')`
    );
    await queryRunner.query(`ALTER TABLE "cases" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "cases" ALTER COLUMN "status" TYPE "public"."cases_status_enum_old" USING "status"::"text"::"public"."cases_status_enum_old"`
    );
    await queryRunner.query(`ALTER TABLE "cases" ALTER COLUMN "status" SET DEFAULT 'new'`);
    await queryRunner.query(`DROP TYPE "public"."cases_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."cases_status_enum_old" RENAME TO "cases_status_enum"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af1e8292e6d5dd63c5a1f5a364" ON "cases" ("created_at", "status", "user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5480495730c8ba4558a33f6962" ON "cases" ("assigned_lawyer_id", "created_at", "status") `
    );
  }
}
