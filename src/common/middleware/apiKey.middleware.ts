import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { Role } from '../enums/role.enum';
import { CustomRequest } from '../types/custom-request.interface';

dotenv.config();
@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: CustomRequest, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];
    const role = req.headers['x-role']; // Assuming role is passed in the headers

    if (!apiKey) {
      throw new UnauthorizedException('Missing API key');
    }

    if (role === Role.Admin) {
      if (apiKey !== process.env.ADMIN_API_KEY) {
        throw new UnauthorizedException('Invalid API key for admin');
      }
      req.user = { roles: [Role.Admin] };
    } else if (role === Role.User) {
      if (apiKey !== process.env.PUBLIC_API_KEY) {
        throw new UnauthorizedException('Invalid API key for all users');
      }
      req.user = { roles: [Role.User] };
    } else {
      throw new UnauthorizedException('Invalid role');
    }

    next();
  }
}
