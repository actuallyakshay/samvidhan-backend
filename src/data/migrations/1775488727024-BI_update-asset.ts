import { MigrationInterface, QueryRunner } from "typeorm";

export class BIUpdateAsset1775488727024 implements MigrationInterface {
    name = 'BIUpdateAsset1775488727024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assets" DROP CONSTRAINT "FK_7555acf09babdf29cf8676cf9f7"`);
        await queryRunner.query(`ALTER TABLE "assets" RENAME COLUMN "uploaded_by_user_id" TO "author"`);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "author"`);
        await queryRunner.query(`ALTER TABLE "assets" ADD "author" character varying`);
        await queryRunner.query(`ALTER TABLE "assets" ALTER COLUMN "asset_type" SET DEFAULT 'other'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assets" ALTER COLUMN "asset_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "author"`);
        await queryRunner.query(`ALTER TABLE "assets" ADD "author" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "assets" RENAME COLUMN "author" TO "uploaded_by_user_id"`);
        await queryRunner.query(`ALTER TABLE "assets" ADD CONSTRAINT "FK_7555acf09babdf29cf8676cf9f7" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
