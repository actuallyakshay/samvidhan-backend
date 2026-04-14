import { MigrationInterface, QueryRunner } from "typeorm";

export class BIUpdating1774675722059 implements MigrationInterface {
    name = 'BIUpdating1774675722059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_999c51720344f22c4954ec30f2"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "is_verified"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "is_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_999c51720344f22c4954ec30f2" ON "lawyer_profiles" ("is_verified") `);
    }

}
