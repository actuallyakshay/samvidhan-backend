import { MigrationInterface, QueryRunner } from "typeorm";

export class BIAdminSettings1775401567214 implements MigrationInterface {
    name = 'BIAdminSettings1775401567214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin_settings" ("id" SERIAL NOT NULL, "support_email" character varying, "support_phone" character varying, CONSTRAINT "PK_8eeabc518a2e33306f19fa557cc" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "admin_settings"`);
    }

}
