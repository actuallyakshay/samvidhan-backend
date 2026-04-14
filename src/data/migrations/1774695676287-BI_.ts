import { MigrationInterface, QueryRunner } from "typeorm";

export class BI_1774695676287 implements MigrationInterface {
    name = 'BI_1774695676287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_notes" DROP CONSTRAINT "FK_53252db00da6d42e5ff8e447767"`);
        await queryRunner.query(`CREATE TYPE "public"."case_session_requests_call_type_enum" AS ENUM('video', 'audio')`);
        await queryRunner.query(`CREATE TYPE "public"."case_session_requests_status_enum" AS ENUM('pending', 'accepted', 'rejected')`);
        await queryRunner.query(`CREATE TYPE "public"."case_session_requests_approved_by_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TYPE "public"."case_session_requests_raised_by_enum" AS ENUM('lawyer', 'admin')`);
        await queryRunner.query(`CREATE TABLE "case_session_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "case_id" uuid NOT NULL, "requested_date" date NOT NULL, "requested_time" TIME NOT NULL, "call_type" "public"."case_session_requests_call_type_enum" NOT NULL, "status" "public"."case_session_requests_status_enum" NOT NULL DEFAULT 'pending', "approved_by" "public"."case_session_requests_approved_by_enum", "raised_by" "public"."case_session_requests_raised_by_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5f7ce9c0b7c0222c12c4b23ed30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_45b2c420f0409d3fc76f372815" ON "case_session_requests" ("case_id") `);
        await queryRunner.query(`ALTER TABLE "case_notes" DROP COLUMN "author_user_id"`);
        await queryRunner.query(`ALTER TABLE "case_notes" DROP COLUMN "is_internal"`);
        await queryRunner.query(`ALTER TABLE "case_notes" DROP COLUMN "note_type"`);
        await queryRunner.query(`DROP TYPE "public"."case_notes_note_type_enum"`);
        await queryRunner.query(`ALTER TABLE "case_session_requests" ADD CONSTRAINT "FK_45b2c420f0409d3fc76f3728154" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_session_requests" DROP CONSTRAINT "FK_45b2c420f0409d3fc76f3728154"`);
        await queryRunner.query(`CREATE TYPE "public"."case_notes_note_type_enum" AS ENUM('admin', 'lawyer')`);
        await queryRunner.query(`ALTER TABLE "case_notes" ADD "note_type" "public"."case_notes_note_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "case_notes" ADD "is_internal" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "case_notes" ADD "author_user_id" uuid NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_45b2c420f0409d3fc76f372815"`);
        await queryRunner.query(`DROP TABLE "case_session_requests"`);
        await queryRunner.query(`DROP TYPE "public"."case_session_requests_raised_by_enum"`);
        await queryRunner.query(`DROP TYPE "public"."case_session_requests_approved_by_enum"`);
        await queryRunner.query(`DROP TYPE "public"."case_session_requests_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."case_session_requests_call_type_enum"`);
        await queryRunner.query(`ALTER TABLE "case_notes" ADD CONSTRAINT "FK_53252db00da6d42e5ff8e447767" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
