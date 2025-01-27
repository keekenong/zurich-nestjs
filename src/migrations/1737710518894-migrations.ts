import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1737710518894 implements MigrationInterface {
  name = 'Migrations1737710518894';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "product_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "product_code" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "product_description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "product_description" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "location"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "location" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "location"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "location" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "product_description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "product_description" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "product_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "product_code" integer`,
    );
  }
}
