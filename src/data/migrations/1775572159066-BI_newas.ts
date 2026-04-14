import { MigrationInterface, QueryRunner } from "typeorm";

export class BINewas1775572159066 implements MigrationInterface {
    name = 'BINewas1775572159066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assets" ADD "asset_name" character varying`);
        await queryRunner.query(`ALTER TABLE "assets" ALTER COLUMN "author" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "assets" ALTER COLUMN "author" SET DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assets" ALTER COLUMN "author" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "assets" ALTER COLUMN "author" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "asset_name"`);
    }

}
