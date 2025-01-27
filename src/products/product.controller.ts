import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  Headers,
  Res,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { ResponseDto } from '../common/dto/response.dto';
import { CustomLogger } from '../utils/logger';
import { Response } from 'express';

@ApiTags('products')
@Controller('products')
export class ProductController {
  private readonly logger: CustomLogger;
  constructor(private readonly productService: ProductService) {
    this.logger = new CustomLogger();
  }

  @Get()
  @ApiHeader({ name: 'x-api-key', description: 'API Key' })
  @ApiHeader({ name: 'x-role', description: 'User Role' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.User)
  async getProduct(
    @Query('productCode') productCode: string,
    @Query('location') location: string,
    @Headers('x-api-key') apiKey: string,
    @Headers('x-role') role: string,
    @Res() res: Response,
  ): Promise<void> {
    let errorMessage;
    try {
      const result = await this.productService.getProduct(
        productCode,
        location,
      );
      const response = new ResponseDto('OK', result);
      res.status(HttpStatus.OK).json(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error({
          error: err,
          message: err.message,
          path: 'ProductContrller/getProduct',
        });
        errorMessage = err.message;
      } else {
        this.logger.error({
          error: err,
          message: 'Internal Service Error',
          path: 'ProductContrller/getProduct',
        });
        errorMessage = 'Internal Service Error';
      }
      const errorResponse = new ResponseDto('NOK', null, errorMessage);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
  }

  @Post()
  @ApiHeader({ name: 'x-api-key', description: 'API Key' })
  @ApiHeader({ name: 'x-role', description: 'User Role' })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Headers('x-api-key') apiKey: string,
    @Headers('x-role') role: string,
    @Res() res: Response,
  ): Promise<void> {
    let errorMessage;
    try {
      const result = await this.productService.createProduct(createProductDto);
      const response = new ResponseDto('OK', result);
      res.status(HttpStatus.CREATED).json(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error({
          error: err,
          message: err.message,
          path: 'ProductContrller/getProduct',
        });
        errorMessage = err.message;
      } else {
        this.logger.error({
          error: err,
          message: 'Internal Service Error',
          path: 'ProductContrller/getProduct',
        });
        errorMessage = 'Internal Service Error';
      }
      const errorResponse = new ResponseDto('NOK', null, errorMessage);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
  }

  @Put()
  @ApiHeader({ name: 'x-api-key', description: 'API Key' })
  @ApiHeader({ name: 'x-role', description: 'User Role' })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async updateProduct(
    @Query('productCode') productCode: string,
    @Headers('x-api-key') apiKey: string,
    @Headers('x-role') role: string,
    @Body() updateProductDto: UpdateProductDto,
    @Res() res: Response,
  ): Promise<void> {
    let errorMessage;
    try {
      const result = await this.productService.updateProduct(
        productCode,
        updateProductDto,
      );
      const response = new ResponseDto('OK', result);
      res.status(HttpStatus.OK).json(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error({
          error: err,
          message: err.message,
          path: 'ProductContrller/getProduct',
        });
        errorMessage = err.message;
      } else {
        this.logger.error({
          error: err,
          message: 'Internal Service Error',
          path: 'ProductContrller/getProduct',
        });
        errorMessage = 'Internal Service Error';
      }
      const errorResponse = new ResponseDto('NOK', null, errorMessage);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
  }

  @Delete()
  @ApiHeader({ name: 'x-api-key', description: 'API Key' })
  @ApiHeader({ name: 'x-role', description: 'User Role' })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async deleteProduct(
    @Query('productCode') productCode: string,
    @Headers('x-api-key') apiKey: string,
    @Headers('x-role') role: string,
    @Res() res: Response,
  ): Promise<void> {
    let errorMessage;
    try {
      const result = await this.productService.deleteProduct(productCode);
      const response = new ResponseDto('OK', result);
      res.status(HttpStatus.OK).json(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error({
          error: err,
          message: err.message,
          path: 'ProductContrller/getProduct',
        });
        errorMessage = err.message;
      } else {
        this.logger.error({
          error: err,
          message: 'Internal Service Error',
          path: 'ProductContrller/getProduct',
        });
        errorMessage = 'Internal Service Error';
      }
      const errorResponse = new ResponseDto('NOK', null, errorMessage);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
  }
}
