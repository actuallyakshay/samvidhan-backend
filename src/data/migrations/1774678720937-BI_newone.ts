import { MigrationInterface, QueryRunner } from "typeorm";

export class BINewone1774678720937 implements MigrationInterface {
    name = 'BINewone1774678720937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "occupation"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_admin" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_admin"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "occupation" character varying`);
    }

}
