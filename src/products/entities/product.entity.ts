import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'PRODUCT' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_code', nullable: false })
  productCode: string;

  @Column({ name: 'product_description', nullable: false })
  productDescription: string;

  @Column({ name: 'location', nullable: false })
  location: string;

  @Column('integer', { name: 'price', nullable: false })
  price: number;

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }
}
