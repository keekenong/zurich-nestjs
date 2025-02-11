import { MigrationInterface, QueryRunner } from "typeorm";

export class EnforceProductCodeNotNull1739262547441 implements MigrationInterface {
    name = 'EnforceProductCodeNotNull1739262547441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "PRODUCT" SET "product_code" = 'DEFAULT_CODE' WHERE "product_code" IS NULL;`);
        await queryRunner.query(`UPDATE "PRODUCT" SET "product_description" = 'No Description' WHERE "product_description" IS NULL;`);
        await queryRunner.query(`UPDATE "PRODUCT" SET "location" = 'Unknown' WHERE "location" IS NULL;`);

        await queryRunner.query(`ALTER TABLE "PRODUCT" ALTER COLUMN "product_code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PRODUCT" ALTER COLUMN "product_description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PRODUCT" ALTER COLUMN "location" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PRODUCT" ALTER COLUMN "price" SET NOT NULL`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "PRODUCT" ALTER COLUMN "price" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PRODUCT" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "PRODUCT" ADD "location" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "PRODUCT" DROP COLUMN "product_description"`);
        await queryRunner.query(`ALTER TABLE "PRODUCT" ADD "product_description" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "PRODUCT" DROP COLUMN "product_code"`);
        await queryRunner.query(`ALTER TABLE "PRODUCT" ADD "product_code" character varying(100) NOT NULL`);
    }

}
