# First time local setup
Pre-requisite
1) Install postgresql server in local device
2) Nodejs >=v20.11
3) Nestjs 11

Run local-setup.sh for first-time local setup (Bash shell or Git Bash):
```
./local-setup.sh
```

# Project Structure

The project is organized within the `src/` directory as follows:

```
.
└── src
    ├── common
    │   ├── decorators
    │   │   └── roles.decorators.ts
    │   ├── dto
    │   │   └── response.dto.ts
    │   ├── enums
    │   │   └── roles.enum.ts
    │   ├── guards
    │   │   └── roles.guard.ts
    │   ├── middleware
    │   │   └── apiKey.middleware.ts
    │   └── types
    │       └── custom-request.interface.ts
    ├── config
    │   └── configuration.ts
    ├── database
    │   └── database.module.ts
    ├── migrations
    ├── products
    │   ├── dto
    │   │   ├── create-product.dto.ts
    │   │   └── update-product.dto.ts
    │   └── entities
    │       └── product.entity.ts
    ├── utils
    │   ├── logger.module.ts
    │   └── logger.ts
    ├── app.modules.ts
    └── main.ts
```

# Database Integration with TypeORM

To integrate the database using TypeORM, follow these steps:

1. **Install TypeORM and database driver**:
  ```bash
  npm install typeorm reflect-metadata pg
  ```

2. **Create a TypeORM configuration file** (`src/config/database.module.ts`):
  ```typescript
  import { Module } from '@nestjs/common';
  import { TypeOrmModule } from '@nestjs/typeorm';

  @Module({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'your-username',
        password: 'your-password',
        database: 'your-database',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    ],
  })
  export class DatabaseModule {}
  ```

3. **Purpose of each config**:
  - `type`: Specifies the database type.
  - `host`: Database server address.
  - `port`: Port number on which the database server is running.
  - `username`: Username for database authentication.
  - `password`: Password for database authentication.
  - `database`: Name of the database to connect to.
  - `entities`: Paths to the entity files.
  - `synchronize`: Automatically synchronize the database schema with the entities.

# Product Module, Controller, and Service

1. **Product Module**:
  - Defined in `src/modules/product.module.ts`.
  - Groups the product controller and service.

2. **Product Controller**:
  - Defined in `src/controllers/product.controller.ts`.
  - Handles HTTP requests related to products.
  - Example:
    ```typescript
    @Controller('products')
    export class ProductController {
      constructor(private readonly productService: ProductService) {}

      @Get()
      findAll(): Promise<Product[]> {
      return this.productService.findAll();
      }
    }
    ```

3. **Product Service**:
  - Defined in `src/services/product.service.ts`.
  - Contains business logic for product operations.
  - Example:
    ```typescript
    @Injectable()
    export class ProductService {
      constructor(@InjectRepository(Product) private productRepository: Repository<Product>) {}

      findAll(): Promise<Product[]> {
      return this.productRepository.find();
      }
    }
    ```

# Request Validation
In this project, the ValidationPipe was used to handle request validation which has been defined in dto(create-product.dto.ts) or entities(product.entity.ts).

1. Setup pipes in main.ts (may refer to [official article](https://docs.nestjs.com/techniques/validation) for more details)
Example: src/main.ts
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //other logic
  app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }));
  s//other logic
}
bootstrap();
```

Example: src/products/entities/product.entity.ts
```typescript
@Entity({ name: 'PRODUCT' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'product_code',nullable:false})
  productCode: string;

  @Column({name: 'product_description',nullable:false})
  productDescription: string;

  @Column({name: 'location',nullable:false})
  location: string;

  @Column('integer', {name: 'price',nullable:false})
  price: number;

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
  }
}
```

# Middleware, Role Guards, and Decorators

1. **Middleware**:
  - Defined in `src/middleware/`.
  - Functions that process requests before they reach the controllers.
  - Example: Logging middleware.

2. **Role Guards**:
  - Defined in `src/guards/`.
  - Handle authorization based on user roles.
  - Example:
    ```typescript
    @Injectable()
    export class RolesGuard implements CanActivate {
      canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      return user && user.roles.includes('admin');
      }
    }
    ```

3. **Decorators**:
  - Defined in `src/decorators/`.
  - Custom decorators for various purposes.
  - Example: `@Roles` decorator to specify required roles for a route.



# Logger Implementation with Winston

1. **Install Winston**:
  ```bash
  npm install winston
  ```

2. **Configure Winston Logger**:
  - Create a logger configuration file (`src/config/logger.ts`):
    ```typescript
    import { createLogger, format, transports } from 'winston';

    const logger = createLogger({
      level: 'info',
      format: format.combine(
      format.timestamp(),
      format.json()
      ),
      transports: [
      new transports.Console(),
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.File({ filename: 'combined.log' })
      ]
    });

    export default logger;
    ```

3. **Use Logger in Application**:
  - Import and use the logger in your application files:
    ```typescript
    import logger from './config/logger';

    logger.info('Application started');
    ```

# API Documentation with Swagger
1. **Install Swagger**:
    ```bash
    npm install @nestjs/swagger swagger-ui-express
    ```
2. **Enable and build Swagger in main.ts**:
  - Update `src/main.ts` to enable Swagger:
      ```typescript
      import { NestFactory } from '@nestjs/core';
      import { AppModule } from './app.module';
      async function bootstrap() {
        const app = await NestFactory.create(AppModule);
        const config = new DocumentBuilder()
        .setTitle('Motor Insurance API')
        .setDescription('API for managing motor insurance products')
        .setVersion('1.0')
        .addBearerAuth()
        .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'apiKey')
        .addApiKey({ type: 'apiKey', name: 'x-role', in: 'header' }, 'role')
        .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api', app, document);
        await app.listen(3000)
      }
      bootstrap();
      ```
4. **Add Swagger Annotations to Product Controller**:
  - Update `src/products/product.controller.ts` to include Swagger decorators:
      ```typescript
      import { Controller, Get, Param } from '@nestjs/common';
      import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
      import { ProductService } from '../services/product.service';
      import { Product } from '../entities/product.entity';
      @ApiTags('products')
      @Controller('products')
      export class ProductController {
        constructor(private readonly productService: ProductService) {}
        @Get()
        @ApiHeader({ name: 'x-api-key', description: 'API Key' })
        @ApiHeader({ name: 'x-role', description: 'User Role' })
        @ApiResponse({ status: 200, description: 'Product retrieved successfully.' })
        @ApiResponse({ status: 400, description: 'Bad Request.' })
        @ApiResponse({ status: 401, description: 'Unauthorized.' })
        async getProduct(): Promise<Product[]> {
          return this.productService.findAll();
        }
      }
      ```
