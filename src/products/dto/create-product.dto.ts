import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productCode!: string;

  @IsString()
  @IsNotEmpty()
  productDescription!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsNotEmpty()
  @IsNumber()
  price!: number;
}
