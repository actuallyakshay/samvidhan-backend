import { MigrationInterface, QueryRunner } from 'typeorm';

export class BIAdminOtpChallenges1775904000000 implements MigrationInterface {
  name = 'BIAdminOtpChallenges1775904000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "admin_login_approvals"`);

    await queryRunner.query(`
      CREATE TABLE "admin_otp_challenges" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "otp_hash" character varying NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_otp_challenges" PRIMARY KEY ("id"),
        CONSTRAINT "FK_admin_otp_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_otp_user_id" ON "admin_otp_challenges" ("user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_otp_expires_at" ON "admin_otp_challenges" ("expires_at") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "admin_otp_challenges"`);
  }
}
