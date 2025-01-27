import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseDto } from '../common/dto/response.dto';
import { CustomLogger } from '../utils/logger';

const mockProductService = {
  getProduct: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;
  let logger: CustomLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
        {
          provide: CustomLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
    logger = module.get<CustomLogger>(CustomLogger);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      jest.spyOn(service, 'getProduct').mockResolvedValue(result);

      const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await controller.getProduct(
        'P001',
        'Location 1',
        'apiKey',
        'role',
        response as any,
      );
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(new ResponseDto('OK', result));
    });

    it('should handle errors', async () => {
      jest.spyOn(service, 'getProduct').mockRejectedValue(new Error('Error'));

      const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await controller.getProduct(
        'P001',
        'Location 1',
        'apiKey',
        'role',
        response as any,
      );
      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith(
        new ResponseDto('NOK', null, 'Error'),
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
      const result = [
        {
          id: 1,
          productCode: 'P001',
          productDescription: 'Product 1',
          location: 'Location 1',
          price: 100,
        },
      ];
      jest.spyOn(service, 'createProduct').mockResolvedValue(result);

      const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await controller.createProduct(
        createProductDto,
        'apiKey',
        'role',
        response as any,
      );
      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith(new ResponseDto('OK', result));
    });

    it('should handle errors', async () => {
      jest
        .spyOn(service, 'createProduct')
        .mockRejectedValue(new Error('Error'));

      const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await controller.createProduct(
        {
          productCode: 'P001',
          productDescription: 'Product 1',
          location: 'Location 1',
          price: 100,
        },
        'apiKey',
        'role',
        response as any,
      );
      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith(
        new ResponseDto('NOK', null, 'Error'),
      );
    });
  });

  describe('updateProduct', () => {
    it('should update a product and return the list of products', async () => {
      const updateProductDto: UpdateProductDto = {
        location: 'Updated Location',
        price: 150,
      };
      const result = [
        {
          id: 1,
          productCode: 'P001',
          productDescription: 'Product 1',
          location: 'Updated Location',
          price: 150,
        },
      ];
      jest.spyOn(service, 'updateProduct').mockResolvedValue(result);

      const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await controller.updateProduct(
        'P001',
        'apiKey',
        'role',
        updateProductDto,
        response as any,
      );
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(new ResponseDto('OK', result));
    });

    it('should handle errors', async () => {
      jest
        .spyOn(service, 'updateProduct')
        .mockRejectedValue(new Error('Error'));

      const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await controller.updateProduct(
        'P001',
        'apiKey',
        'role',
        { location: 'Updated Location', price: 150 },
        response as any,
      );
      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith(
        new ResponseDto('NOK', null, 'Error'),
      );
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
      jest.spyOn(service, 'deleteProduct').mockResolvedValue(result);

      const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await controller.deleteProduct('P001', 'apiKey', 'role', response as any);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(new ResponseDto('OK', result));
    });

    it('should handle errors', async () => {
      jest
        .spyOn(service, 'deleteProduct')
        .mockRejectedValue(new Error('Error'));

      const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await controller.deleteProduct('P001', 'apiKey', 'role', response as any);
      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith(
        new ResponseDto('NOK', null, 'Error'),
      );
    });
  });
});
