import { MigrationInterface, QueryRunner } from 'typeorm';

export class BINewCp1776248682068 implements MigrationInterface {
  name = 'BINewCp1776248682068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "admin_settings" ADD "support_address" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "admin_settings" DROP COLUMN "support_address"`);
  }
}
