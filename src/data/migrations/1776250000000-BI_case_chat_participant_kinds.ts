import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Case messages: sender_kind (user/lawyer/admin) replaces sender_id.
 * Read states: (case_id, reader_kind) replaces per-user rows.
 */
export class BICaseChatParticipantKinds1776250000000 implements MigrationInterface {
  name = 'BICaseChatParticipantKinds1776250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "case_messages" ADD COLUMN "sender_kind" character varying(16)`
    );
    await queryRunner.query(`
      UPDATE "case_messages" cm
      SET "sender_kind" = CASE
        WHEN cm."sender_id" = c."user_id" THEN 'user'
        WHEN EXISTS (SELECT 1 FROM "users" u WHERE u."id" = cm."sender_id" AND u."is_admin" = true) THEN 'admin'
        WHEN c."assigned_lawyer_id" IS NOT NULL AND EXISTS (
          SELECT 1 FROM "lawyer_profiles" lp
          WHERE lp."id" = c."assigned_lawyer_id" AND lp."user_id" = cm."sender_id"
        ) THEN 'lawyer'
        ELSE 'lawyer'
      END
      FROM "cases" c
      WHERE c."id" = cm."case_id"
    `);
    await queryRunner.query(`ALTER TABLE "case_messages" ALTER COLUMN "sender_kind" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "case_messages" DROP CONSTRAINT IF EXISTS "FK_f6e1ede152ea15c29f351a50a78"`
    );
    await queryRunner.query(`ALTER TABLE "case_messages" DROP COLUMN "sender_id"`);

    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" ADD COLUMN "reader_kind" character varying(16)`
    );
    await queryRunner.query(`
      UPDATE "case_chat_read_states" r
      SET "reader_kind" = CASE
        WHEN r."user_id" = c."user_id" THEN 'user'
        WHEN EXISTS (SELECT 1 FROM "users" u WHERE u."id" = r."user_id" AND u."is_admin" = true) THEN 'admin'
        WHEN c."assigned_lawyer_id" IS NOT NULL AND EXISTS (
          SELECT 1 FROM "lawyer_profiles" lp
          WHERE lp."id" = c."assigned_lawyer_id" AND lp."user_id" = r."user_id"
        ) THEN 'lawyer'
        ELSE 'lawyer'
      END
      FROM "cases" c
      WHERE c."id" = r."case_id"
    `);

    await queryRunner.query(`
      DELETE FROM "case_chat_read_states" crs
      WHERE crs."id" NOT IN (
        SELECT id FROM (
          SELECT DISTINCT ON ("case_id", "reader_kind") "id"
          FROM "case_chat_read_states"
          ORDER BY "case_id", "reader_kind", "updated_at" DESC
        ) keep_rows
      )
    `);

    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" ALTER COLUMN "reader_kind" SET NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" DROP CONSTRAINT IF EXISTS "UQ_case_chat_read_user_case"`
    );
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" DROP CONSTRAINT IF EXISTS "FK_ccrs_user"`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ccrs_user_id"`);
    await queryRunner.query(`ALTER TABLE "case_chat_read_states" DROP COLUMN "user_id"`);

    await queryRunner.query(`
      ALTER TABLE "case_chat_read_states"
      ADD CONSTRAINT "UQ_case_chat_read_case_reader" UNIQUE ("case_id", "reader_kind")
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_ccrs_reader_kind" ON "case_chat_read_states" ("reader_kind")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" DROP CONSTRAINT IF EXISTS "UQ_case_chat_read_case_reader"`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ccrs_reader_kind"`);
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" DROP COLUMN IF EXISTS "reader_kind"`
    );
    await queryRunner.query(`ALTER TABLE "case_messages" DROP COLUMN IF EXISTS "sender_kind"`);
    await queryRunner.query(
      `ALTER TABLE "case_messages" ADD COLUMN IF NOT EXISTS "sender_id" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "case_chat_read_states" ADD COLUMN IF NOT EXISTS "user_id" uuid`
    );
  }
}
