import { MigrationInterface, QueryRunner } from 'typeorm';

export class BICaseChatReadStates1776100000000 implements MigrationInterface {
  name = 'BICaseChatReadStates1776100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "case_chat_read_states" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "case_id" uuid NOT NULL,
        "last_read_message_id" uuid,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_case_chat_read_states" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_case_chat_read_user_case" UNIQUE ("user_id", "case_id"),
        CONSTRAINT "FK_ccrs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_ccrs_case" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_ccrs_last_msg" FOREIGN KEY ("last_read_message_id") REFERENCES "case_messages"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_ccrs_user_id" ON "case_chat_read_states" ("user_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ccrs_case_id" ON "case_chat_read_states" ("case_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "case_chat_read_states"`);
  }
}
