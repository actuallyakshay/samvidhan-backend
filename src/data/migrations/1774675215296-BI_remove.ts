import { MigrationInterface, QueryRunner } from "typeorm";

export class BIRemove1774675215296 implements MigrationInterface {
    name = 'BIRemove1774675215296'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "gender" character varying`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "dob" date`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "address_line_1" character varying`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "address_line_2" character varying`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "city" character varying`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "state" character varying`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "pincode" character varying`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "occupation" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "occupation"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "pincode"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "address_line_2"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "address_line_1"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "dob"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "gender"`);
    }

}
