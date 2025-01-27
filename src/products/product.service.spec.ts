import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CustomLogger } from '../utils/logger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const mockProductRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('ProductService', () => {
  let service: ProductService;
  let repository: Repository<ProductEntity>;
  let logger: CustomLogger;
  let cacheManager: Cache;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepository,
        },
        {
          provide: CustomLogger,
          useValue: mockLogger,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<Repository<ProductEntity>>(
      getRepositoryToken(ProductEntity),
    );
    logger = module.get<CustomLogger>(CustomLogger);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProduct', () => {
    it('should return a list of products', async () => {
      const result = [
        {
          id: 1,
          productCode: 'P001',
          productDescription: 'Product 1',
          location: 'Location 1',
          price: 100,
        },
      ];
      mockCacheManager.get.mockResolvedValue(result);

      expect(await service.getProduct('P001', 'Location 1')).toEqual(result);
      expect(logger.log).toHaveBeenCalledWith(
        'Fetching product(s) with code: P001 and location: Location 1 from cache',
      );
    });

    it('should return a list of products from database and cache it', async () => {
      const result = [
        {
          id: 1,
          productCode: 'P001',
          productDescription: 'Product 1',
          location: 'Location 1',
          price: 100,
        },
      ];
      mockCacheManager.get.mockResolvedValue(null);
      mockProductRepository.find.mockResolvedValue(result);

      const products = await service.getProduct('P001', 'Location 1');
      expect(products).toEqual(result);
      expect(logger.log).toHaveBeenCalledWith(
        'Fetching product(s) with code: P001 and location: Location 1',
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'product_P001_Location 1',
        result,
        300,
      );
    });
  });

  describe('createProduct', () => {
    it('should create a product and return the list of products', async () => {
      const createProductDto: CreateProductDto = {
        productCode: 'P001',
        productDescription: 'Product 1',
        location: 'Location 1',
        price: 100,
      };
      const newProduct = { id: 1, ...createProductDto };
      const result = [newProduct];
      jest.spyOn(repository, 'create').mockReturnValue(newProduct);
      jest.spyOn(repository, 'save').mockResolvedValue(newProduct);
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.createProduct(createProductDto)).toEqual(result);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        'Product created with code: P001',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        'Displaying all products after creation',
      );
    });
  });

  describe('updateProduct', () => {
    it('should update a product and return the list of products', async () => {
      const updateProductDto: UpdateProductDto = {
        location: 'Updated Location',
        price: 150,
      };
      const updatedProduct = {
        id: 1,
        productCode: 'P001',
        productDescription: 'test product',
        ...updateProductDto,
      };
      const result = [updatedProduct];
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      jest.spyOn(repository, 'findOne').mockResolvedValue(updatedProduct);
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.updateProduct('P001', updateProductDto)).toEqual(
        result,
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        `Product updated with code: P001`,
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        'Displaying all products after update',
      );
    });

    it('should throw error if targeted product not found', async () => {
      const updateProductDto: UpdateProductDto = {
        location: 'Updated Location',
        price: 150,
      };
      const updatedProduct = {
        id: 1,
        productCode: 'P001',
        productDescription: 'test product',
        ...updateProductDto,
      };
      const result = [updatedProduct];
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 0, raw: [], generatedMaps: [] });
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateProduct('P001', updateProductDto),
      ).rejects.toThrow('Product not found');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product and return the list of products', async () => {
      const result = [
        {
          id: 1,
          productCode: 'P001',
          productDescription: 'Product 1',
          location: 'Location 1',
          price: 100,
        },
      ];
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1, raw: [] });
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      await expect(service.deleteProduct('P001')).resolves.toEqual([]);
      expect(logger.log).toHaveBeenCalledWith(
        'Product deleted with code: P001',
      );
    });

    it('should throw error if deleted item still exists in product list', async () => {
      const result = [
        {
          id: 1,
          productCode: 'P001',
          productDescription: 'Product 1',
          location: 'Location 1',
          price: 100,
        },
      ];
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1, raw: [] });
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      await expect(service.deleteProduct('P001')).rejects.toThrow(
        'Product not deleted',
      );
    });
  });
});
