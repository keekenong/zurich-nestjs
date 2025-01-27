import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CustomLogger } from '../utils/logger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly logger: CustomLogger,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getProduct(
    productCode: string,
    location: string,
  ): Promise<ProductEntity[]> {
    const cacheKey =
      productCode && location
        ? `product_${productCode}_${location}`
        : 'products';
    const cachedProducts =
      await this.cacheManager.get<ProductEntity[]>(cacheKey);
    if (cachedProducts) {
      this.logger.log(
        `Fetching product(s) ${productCode ? `with code: ${productCode} and location: ${location}` : ''} from cache`,
      );
      return cachedProducts;
    }

    this.logger.log(
      `Fetching product(s) ${productCode ? `with code: ${productCode} and location: ${location}` : ''}`,
    );
    const products = await this.productRepository.find({
      where: { productCode, location },
      order: { id: 'ASC' },
    });
    await this.cacheManager.set(cacheKey, products, 300);
    return products;
  }

  async createProduct(
    createProductDto: CreateProductDto,
  ): Promise<ProductEntity[]> {
    const newProduct = this.productRepository.create(createProductDto);
    await this.productRepository.save(newProduct);
    this.logger.log(
      `Product created with code: ${createProductDto.productCode}`,
    );
    this.logger.log(`Displaying all products after creation`);
    const postCreateProductList = this.productRepository.find({
      order: { id: 'DESC' },
    });
    return postCreateProductList;
  }

  async updateProduct(
    productCode: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity[]> {
    await this.productRepository.update(
      { productCode, location: updateProductDto.location },
      updateProductDto,
    );
    const product: unknown = await this.productRepository.findOne({
      where: { productCode, location: updateProductDto.location },
    });
    if (!product) {
      throw new Error('Product not found');
    }
    this.logger.log(`Product updated with code: ${productCode}`);
    this.logger.log(`Displaying all products after update`);
    const postUpdateProductList = await this.productRepository.find({
      order: { id: 'ASC' },
    });
    return postUpdateProductList;
  }

  async deleteProduct(productCode: string): Promise<ProductEntity[]> {
    await this.productRepository.delete({ productCode });
    this.logger.log(`Product deleted with code: ${productCode}`);
    const postDeleteProductList = await this.productRepository.find({
      order: { id: 'ASC' },
    });
    if (
      postDeleteProductList.some(
        (product) => product.productCode === productCode,
      )
    ) {
      throw new Error('Product not deleted');
    }
    return postDeleteProductList;
  }
}
