import { MigrationInterface, QueryRunner } from 'typeorm';

export class BILawyerDcos1776232549750 implements MigrationInterface {
  name = 'BILawyerDcos1776232549750';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "case_chat_read_states" DROP CONSTRAINT "FK_ccrs_case"`);
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" DROP CONSTRAINT "FK_ccrs_last_msg"`
    );
    await queryRunner.query(
      `ALTER TABLE "admin_otp_challenges" DROP CONSTRAINT "FK_admin_otp_user"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_ccrs_case_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ccrs_reader_kind"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_admin_otp_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_admin_otp_expires_at"`);
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" DROP CONSTRAINT "UQ_case_chat_read_case_reader"`
    );
    await queryRunner.query(
      `ALTER TABLE "lawyer_profiles" ADD "is_verified" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_999c51720344f22c4954ec30f2" ON "lawyer_profiles" ("is_verified") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9c20eaaaaa71b48870202b0e0d" ON "case_chat_read_states" ("reader_kind") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f6ab198f5af3c427a9e7a1ddf" ON "case_chat_read_states" ("case_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e383c3b9a853772542a48bbe00" ON "admin_otp_challenges" ("expires_at") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b31254fcdeadc48b8113dc6b2e" ON "admin_otp_challenges" ("user_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" ADD CONSTRAINT "UQ_8afec3b20b5d1ed54292c613907" UNIQUE ("case_id", "reader_kind")`
    );
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" ADD CONSTRAINT "FK_6f6ab198f5af3c427a9e7a1ddf8" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" ADD CONSTRAINT "FK_5854ef6f304305953750caf9e45" FOREIGN KEY ("last_read_message_id") REFERENCES "case_messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "admin_otp_challenges" ADD CONSTRAINT "FK_b31254fcdeadc48b8113dc6b2e4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin_otp_challenges" DROP CONSTRAINT "FK_b31254fcdeadc48b8113dc6b2e4"`
    );
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" DROP CONSTRAINT "FK_5854ef6f304305953750caf9e45"`
    );
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" DROP CONSTRAINT "FK_6f6ab198f5af3c427a9e7a1ddf8"`
    );
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" DROP CONSTRAINT "UQ_8afec3b20b5d1ed54292c613907"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_b31254fcdeadc48b8113dc6b2e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e383c3b9a853772542a48bbe00"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6f6ab198f5af3c427a9e7a1ddf"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9c20eaaaaa71b48870202b0e0d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_999c51720344f22c4954ec30f2"`);
    await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "is_verified"`);
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" ADD CONSTRAINT "UQ_case_chat_read_case_reader" UNIQUE ("case_id", "reader_kind")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_otp_expires_at" ON "admin_otp_challenges" ("expires_at") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_otp_user_id" ON "admin_otp_challenges" ("user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ccrs_reader_kind" ON "case_chat_read_states" ("reader_kind") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ccrs_case_id" ON "case_chat_read_states" ("case_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "admin_otp_challenges" ADD CONSTRAINT "FK_admin_otp_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" ADD CONSTRAINT "FK_ccrs_last_msg" FOREIGN KEY ("last_read_message_id") REFERENCES "case_messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" ADD CONSTRAINT "FK_ccrs_case" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
