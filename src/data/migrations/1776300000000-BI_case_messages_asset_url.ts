import { MigrationInterface, QueryRunner } from 'typeorm';

export class BI1776300000000CaseMessagesAssetUrl1776300000000 implements MigrationInterface {
  name = 'BI1776300000000CaseMessagesAssetUrl1776300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "case_messages" ADD "asset_url" text`);
    await queryRunner.query(`ALTER TABLE "case_messages" ADD "asset_name" character varying(512)`);
    await queryRunner.query(`
      UPDATE "case_messages" cm
      SET "asset_url" = a."asset_url", "asset_name" = a."asset_name"
      FROM "assets" a
      WHERE cm."asset_id" IS NOT NULL AND cm."asset_id" = a."id"
    `);
    await queryRunner.query(
      `ALTER TABLE "case_messages" DROP CONSTRAINT IF EXISTS "FK_071df8e16f0c51fd45e6a0052b5"`
    );
    await queryRunner.query(`ALTER TABLE "case_messages" DROP COLUMN IF EXISTS "asset_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "case_messages" DROP COLUMN IF EXISTS "asset_name"`);
    await queryRunner.query(`ALTER TABLE "case_messages" DROP COLUMN IF EXISTS "asset_url"`);
    await queryRunner.query(`ALTER TABLE "case_messages" ADD "asset_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "case_messages" ADD CONSTRAINT "FK_071df8e16f0c51fd45e6a0052b5" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
