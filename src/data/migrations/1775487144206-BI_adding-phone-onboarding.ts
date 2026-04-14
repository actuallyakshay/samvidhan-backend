import { MigrationInterface, QueryRunner } from "typeorm";

export class BIAddingPhoneOnboarding1775487144206 implements MigrationInterface {
    name = 'BIAddingPhoneOnboarding1775487144206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "is_profile_completed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_profile_completed"`);
    }

}
