import { MigrationInterface, QueryRunner } from 'typeorm';

export class BINew1774543159261 implements MigrationInterface {
  name = 'BINew1774543159261';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "case_id" uuid, "uploaded_by_user_id" uuid NOT NULL, "asset_url" text NOT NULL, "asset_type" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da96729a8b113377cfb6a62439c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_272aaa0695c7e7f85bed38222f" ON "assets" ("case_id") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."case_messages_message_type_enum" AS ENUM('text', 'image', 'document', 'audio')`
    );
    await queryRunner.query(
      `CREATE TABLE "case_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "case_id" uuid NOT NULL, "sender_id" uuid NOT NULL, "message_type" "public"."case_messages_message_type_enum" NOT NULL DEFAULT 'text', "message_text" text, "asset_id" uuid, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_abd10cae638adbb2365d2446d10" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd19638ea2c0359680936818ea" ON "case_messages" ("case_id", "created_at") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."case_notes_note_type_enum" AS ENUM('admin', 'lawyer')`
    );
    await queryRunner.query(
      `CREATE TABLE "case_notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "case_id" uuid NOT NULL, "author_user_id" uuid NOT NULL, "author" character varying, "is_internal" boolean NOT NULL DEFAULT false, "note_type" "public"."case_notes_note_type_enum" NOT NULL, "note" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_474011f166285b8da9a653af5c5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4d26581343306e406774e5c9c8" ON "case_notes" ("case_id") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cases_status_enum" AS ENUM('new', 'under_review', 'lawyer_assigned', 'in_consultation', 'waiting_for_user', 'resolved', 'closed', 'rejected')`
    );
    await queryRunner.query(
      `CREATE TABLE "cases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "case_code" character varying NOT NULL, "user_id" uuid NOT NULL, "assigned_lawyer_id" uuid, "practice_area_id" uuid, "title" character varying NOT NULL, "description" text NOT NULL, "status" "public"."cases_status_enum" NOT NULL DEFAULT 'new', "is_emergency" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1b751fc0b998422d8408ba0fe84" UNIQUE ("case_code"), CONSTRAINT "PK_264acb3048c240fb89aa34626db" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_050257d1dfa826275982b85af9" ON "cases" ("user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d1efd96a6ed448c331fe9c49cd" ON "cases" ("created_at") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5480495730c8ba4558a33f6962" ON "cases" ("assigned_lawyer_id", "status", "created_at") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af1e8292e6d5dd63c5a1f5a364" ON "cases" ("user_id", "status", "created_at") `
    );
    await queryRunner.query(`CREATE INDEX "IDX_c71df5e7279ba08e88c6b47a55" ON "cases" ("status") `);
    await queryRunner.query(
      `CREATE TABLE "practice_areas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_267418202863f01aeae5f35732b" UNIQUE ("name"), CONSTRAINT "PK_e4795fca3b6de92d34889ccc07b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "lawyer_practice_areas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lawyer_profile_id" uuid NOT NULL, "practice_area_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e3e56f5f4f787d6de3fe7ba47bb" UNIQUE ("lawyer_profile_id", "practice_area_id"), CONSTRAINT "PK_01ef67d17bfaa77c3e0023492a0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "lawyer_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "enrollment_number" character varying, "bar_council_name" character varying, "career_start_date" date, "bio" text, "expertise_summary" text, "is_verified" boolean NOT NULL DEFAULT false, "is_available" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e3153d77af25366a0e4ce9d17e9" UNIQUE ("enrollment_number"), CONSTRAINT "REL_d19b6d9b6147d3c5a59463f4f4" UNIQUE ("user_id"), CONSTRAINT "PK_c87c8abf37eada0bbecee89882d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3e792c056fb2200842148a64ae" ON "lawyer_profiles" ("is_verified", "is_available") `
    );
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "gender" character varying, "dob" date, "address_line_1" character varying, "address_line_2" character varying, "city" character varying, "state" character varying, "pincode" character varying, "occupation" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_6ca9503d77ae39b4b5a6cc3ba8" UNIQUE ("user_id"), CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."roles_code_enum" AS ENUM('user', 'lawyer', 'admin')`
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" "public"."roles_code_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f6d54f95c31b73fb1bdd8e91d0c" UNIQUE ("code"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_roles_status_enum" AS ENUM('active', 'pending', 'inactive', 'rejected')`
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "role_id" uuid NOT NULL, "status" "public"."user_roles_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_23ed6f04fe43066df08379fd034" UNIQUE ("user_id", "role_id"), CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d162afeddac672d0e0a9d5564" ON "user_roles" ("user_id", "status") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_provider_enum" AS ENUM('google', 'email')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_account_status_enum" AS ENUM('active', 'inactive', 'suspended')`
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "provider" "public"."users_provider_enum" NOT NULL DEFAULT 'email', "password_hash" text, "account_status" "public"."users_account_status_enum" NOT NULL DEFAULT 'active', "avatar_url" text, "fcm_token" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4305aedaa7aed08419da6a29ec" ON "users" ("provider") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c9b5b525a96ddc2c5647d7f7fa" ON "users" ("created_at") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7dd1db6463f2f62f035cec54ad" ON "users" ("account_status") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscription_plans_billing_cycle_enum" AS ENUM('monthly', 'quarterly', 'yearly')`
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "price_inr" numeric(10,2) NOT NULL, "billing_cycle" "public"."subscription_plans_billing_cycle_enum" NOT NULL, "max_active_cases" integer, "unlimited_queries" boolean NOT NULL DEFAULT false, "priority_support" boolean NOT NULL DEFAULT false, "emergency_support" boolean NOT NULL DEFAULT false, "onsite_assistance_possible" boolean NOT NULL DEFAULT false, "response_sla_hours" integer, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ae18a0f6e0143f06474aa8cef1f" UNIQUE ("name"), CONSTRAINT "UQ_0ebf9b0f0cbd7b2fb5b62e3facb" UNIQUE ("slug"), CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token_hash" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7838d2ba25be1342091b6695f" ON "refresh_tokens" ("token_hash") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ba3bd69c8ad1e799c0256e9e50" ON "refresh_tokens" ("expires_at") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3ddc983c5f7bcf132fd8732c3f" ON "refresh_tokens" ("user_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ADD CONSTRAINT "FK_272aaa0695c7e7f85bed38222f1" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ADD CONSTRAINT "FK_7555acf09babdf29cf8676cf9f7" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "case_messages" ADD CONSTRAINT "FK_5b3b267efe4cfecbd9fa66a8449" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "case_messages" ADD CONSTRAINT "FK_f6e1ede152ea15c29f351a50a78" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "case_messages" ADD CONSTRAINT "FK_071df8e16f0c51fd45e6a0052b5" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "case_notes" ADD CONSTRAINT "FK_4d26581343306e406774e5c9c8c" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "case_notes" ADD CONSTRAINT "FK_53252db00da6d42e5ff8e447767" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "cases" ADD CONSTRAINT "FK_050257d1dfa826275982b85af92" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "cases" ADD CONSTRAINT "FK_af70b58f02c068c47a99c0584a1" FOREIGN KEY ("assigned_lawyer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "cases" ADD CONSTRAINT "FK_cae0a8aad8b5dbc75dd8ef4d199" FOREIGN KEY ("practice_area_id") REFERENCES "practice_areas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "lawyer_practice_areas" ADD CONSTRAINT "FK_2f766d1f610d0a751e9d41b0e30" FOREIGN KEY ("lawyer_profile_id") REFERENCES "lawyer_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "lawyer_practice_areas" ADD CONSTRAINT "FK_d603b1e3502b7533e83f32fd402" FOREIGN KEY ("practice_area_id") REFERENCES "practice_areas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "lawyer_profiles" ADD CONSTRAINT "FK_d19b6d9b6147d3c5a59463f4f40" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(`
        INSERT INTO "practice_areas" ("name")
        VALUES
            ('Civil Law'),
            ('Criminal Law'),
            ('Family Law'),
            ('Property Dispute'),
            ('Corporate Law'),
            ('Consumer Complaint'),
            ('Documentation / Legal Notice'),
            ('Other')
        ON CONFLICT ("name") DO NOTHING
    `);
    await queryRunner.query(`
        INSERT INTO "roles" ("code")
        VALUES
            ('user'),
            ('lawyer')
        ON CONFLICT ("code") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`
    );
    await queryRunner.query(
      `ALTER TABLE "lawyer_profiles" DROP CONSTRAINT "FK_d19b6d9b6147d3c5a59463f4f40"`
    );
    await queryRunner.query(
      `ALTER TABLE "lawyer_practice_areas" DROP CONSTRAINT "FK_d603b1e3502b7533e83f32fd402"`
    );
    await queryRunner.query(
      `ALTER TABLE "lawyer_practice_areas" DROP CONSTRAINT "FK_2f766d1f610d0a751e9d41b0e30"`
    );
    await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT "FK_cae0a8aad8b5dbc75dd8ef4d199"`);
    await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT "FK_af70b58f02c068c47a99c0584a1"`);
    await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT "FK_050257d1dfa826275982b85af92"`);
    await queryRunner.query(
      `ALTER TABLE "case_notes" DROP CONSTRAINT "FK_53252db00da6d42e5ff8e447767"`
    );
    await queryRunner.query(
      `ALTER TABLE "case_notes" DROP CONSTRAINT "FK_4d26581343306e406774e5c9c8c"`
    );
    await queryRunner.query(
      `ALTER TABLE "case_messages" DROP CONSTRAINT "FK_071df8e16f0c51fd45e6a0052b5"`
    );
    await queryRunner.query(
      `ALTER TABLE "case_messages" DROP CONSTRAINT "FK_f6e1ede152ea15c29f351a50a78"`
    );
    await queryRunner.query(
      `ALTER TABLE "case_messages" DROP CONSTRAINT "FK_5b3b267efe4cfecbd9fa66a8449"`
    );
    await queryRunner.query(
      `ALTER TABLE "assets" DROP CONSTRAINT "FK_7555acf09babdf29cf8676cf9f7"`
    );
    await queryRunner.query(
      `ALTER TABLE "assets" DROP CONSTRAINT "FK_272aaa0695c7e7f85bed38222f1"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_3ddc983c5f7bcf132fd8732c3f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ba3bd69c8ad1e799c0256e9e50"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a7838d2ba25be1342091b6695f"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "subscription_plans"`);
    await queryRunner.query(`DROP TYPE "public"."subscription_plans_billing_cycle_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7dd1db6463f2f62f035cec54ad"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c9b5b525a96ddc2c5647d7f7fa"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4305aedaa7aed08419da6a29ec"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_account_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_provider_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2d162afeddac672d0e0a9d5564"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TYPE "public"."user_roles_status_enum"`);
    await queryRunner.query(`DELETE FROM "roles" WHERE "code" IN ('user', 'lawyer')`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TYPE "public"."roles_code_enum"`);
    await queryRunner.query(`DROP TABLE "user_profiles"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3e792c056fb2200842148a64ae"`);
    await queryRunner.query(`DROP TABLE "lawyer_profiles"`);
    await queryRunner.query(`DROP TABLE "lawyer_practice_areas"`);
    await queryRunner.query(`DROP TABLE "practice_areas"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c71df5e7279ba08e88c6b47a55"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_af1e8292e6d5dd63c5a1f5a364"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5480495730c8ba4558a33f6962"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d1efd96a6ed448c331fe9c49cd"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_050257d1dfa826275982b85af9"`);
    await queryRunner.query(`DROP TABLE "cases"`);
    await queryRunner.query(`DROP TYPE "public"."cases_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4d26581343306e406774e5c9c8"`);
    await queryRunner.query(`DROP TABLE "case_notes"`);
    await queryRunner.query(`DROP TYPE "public"."case_notes_note_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cd19638ea2c0359680936818ea"`);
    await queryRunner.query(`DROP TABLE "case_messages"`);
    await queryRunner.query(`DROP TYPE "public"."case_messages_message_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_272aaa0695c7e7f85bed38222f"`);
    await queryRunner.query(`DROP TABLE "assets"`);
    await queryRunner.query(
      `DELETE FROM "practice_areas" WHERE "name" IN ('Civil Law', 'Criminal Law', 'Family Law', 'Property Dispute', 'Corporate Law', 'Consumer Complaint', 'Documentation / Legal Notice', 'Other')`
    );
  }
}
