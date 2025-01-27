import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  location: string;

  @IsNumber()
  @IsOptional()
  price: number;
}
