import { MigrationInterface, QueryRunner } from "typeorm";

export class BIPo1774712505884 implements MigrationInterface {
    name = 'BIPo1774712505884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT "FK_af70b58f02c068c47a99c0584a1"`);
        await queryRunner.query(`ALTER TABLE "cases" ADD CONSTRAINT "FK_af70b58f02c068c47a99c0584a1" FOREIGN KEY ("assigned_lawyer_id") REFERENCES "lawyer_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT "FK_af70b58f02c068c47a99c0584a1"`);
        await queryRunner.query(`ALTER TABLE "cases" ADD CONSTRAINT "FK_af70b58f02c068c47a99c0584a1" FOREIGN KEY ("assigned_lawyer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
