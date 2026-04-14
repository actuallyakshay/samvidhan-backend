import { MigrationInterface, QueryRunner } from "typeorm";

export class BIUpdaetingCase1775493706940 implements MigrationInterface {
    name = 'BIUpdaetingCase1775493706940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_session_requests" ADD "meeting_uri" character varying`);
        await queryRunner.query(`ALTER TABLE "case_session_requests" ALTER COLUMN "call_type" SET DEFAULT 'video'`);
        await queryRunner.query(`ALTER TYPE "public"."case_session_requests_raised_by_enum" RENAME TO "case_session_requests_raised_by_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."case_session_requests_raised_by_enum" AS ENUM('lawyer', 'admin', 'user')`);
        await queryRunner.query(`ALTER TABLE "case_session_requests" ALTER COLUMN "raised_by" TYPE "public"."case_session_requests_raised_by_enum" USING "raised_by"::"text"::"public"."case_session_requests_raised_by_enum"`);
        await queryRunner.query(`ALTER TABLE "case_session_requests" ALTER COLUMN "raised_by" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."case_session_requests_raised_by_enum_old"`);
        await queryRunner.query(`ALTER TABLE "case_session_requests" ALTER COLUMN "raised_by" SET DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "case_session_requests" ALTER COLUMN "raised_by" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "public"."case_session_requests_raised_by_enum_old" AS ENUM('lawyer', 'admin')`);
        await queryRunner.query(`ALTER TABLE "case_session_requests" ALTER COLUMN "raised_by" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "case_session_requests" ALTER COLUMN "raised_by" TYPE "public"."case_session_requests_raised_by_enum_old" USING "raised_by"::"text"::"public"."case_session_requests_raised_by_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."case_session_requests_raised_by_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."case_session_requests_raised_by_enum_old" RENAME TO "case_session_requests_raised_by_enum"`);
        await queryRunner.query(`ALTER TABLE "case_session_requests" ALTER COLUMN "call_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "case_session_requests" DROP COLUMN "meeting_uri"`);
    }

}
