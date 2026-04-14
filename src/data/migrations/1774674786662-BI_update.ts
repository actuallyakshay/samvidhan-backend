import { MigrationInterface, QueryRunner } from "typeorm";

export class BIUpdate1774674786662 implements MigrationInterface {
    name = 'BIUpdate1774674786662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3e792c056fb2200842148a64ae"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "UQ_23ed6f04fe43066df08379fd034"`);
        await queryRunner.query(`ALTER TABLE "user_roles" RENAME COLUMN "role_id" TO "role_code"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP CONSTRAINT "UQ_e3153d77af25366a0e4ce9d17e9"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "enrollment_number"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "bar_council_name"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "expertise_summary"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "is_available"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "degree" character varying`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "bar_council_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "role_code"`);
        await queryRunner.query(`CREATE TYPE "public"."user_roles_role_code_enum" AS ENUM('user', 'lawyer', 'admin')`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "role_code" "public"."user_roles_role_code_enum" NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_d19b6d9b6147d3c5a59463f4f4" ON "lawyer_profiles" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_999c51720344f22c4954ec30f2" ON "lawyer_profiles" ("is_verified") `);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "UQ_2e8dbbb0f7261e7a2ef84a494cb" UNIQUE ("user_id", "role_code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "UQ_2e8dbbb0f7261e7a2ef84a494cb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_999c51720344f22c4954ec30f2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d19b6d9b6147d3c5a59463f4f4"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "role_code"`);
        await queryRunner.query(`DROP TYPE "public"."user_roles_role_code_enum"`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "role_code" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "bar_council_id"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" DROP COLUMN "degree"`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "is_available" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "expertise_summary" text`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "bar_council_name" character varying`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD "enrollment_number" character varying`);
        await queryRunner.query(`ALTER TABLE "lawyer_profiles" ADD CONSTRAINT "UQ_e3153d77af25366a0e4ce9d17e9" UNIQUE ("enrollment_number")`);
        await queryRunner.query(`ALTER TABLE "user_roles" RENAME COLUMN "role_code" TO "role_id"`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "UQ_23ed6f04fe43066df08379fd034" UNIQUE ("user_id", "role_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_3e792c056fb2200842148a64ae" ON "lawyer_profiles" ("is_available", "is_verified") `);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
