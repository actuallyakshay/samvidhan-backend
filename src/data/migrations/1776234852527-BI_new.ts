import { MigrationInterface, QueryRunner } from 'typeorm';

export class BINew1776234852527 implements MigrationInterface {
  name = 'BINew1776234852527';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "lawyer_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lawyer_profile_id" uuid NOT NULL, "asset_url" text NOT NULL, "asset_name" character varying(512), "is_approved" boolean NOT NULL DEFAULT false, "rejection_reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f1ffcf3eec89140e3898e1171f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a73f102b070a55fc1e8bd7bd72" ON "lawyer_documents" ("is_approved") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e34062d4c9ddc7f4bbf8a579cc" ON "lawyer_documents" ("lawyer_profile_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "lawyer_documents" ADD CONSTRAINT "FK_e34062d4c9ddc7f4bbf8a579ccc" FOREIGN KEY ("lawyer_profile_id") REFERENCES "lawyer_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lawyer_documents" DROP CONSTRAINT "FK_e34062d4c9ddc7f4bbf8a579ccc"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_e34062d4c9ddc7f4bbf8a579cc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a73f102b070a55fc1e8bd7bd72"`);
    await queryRunner.query(`DROP TABLE "lawyer_documents"`);
  }
}
