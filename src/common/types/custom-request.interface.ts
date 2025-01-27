import { Request } from 'express';
import { Role } from '../enums/role.enum';

export interface CustomRequest extends Request {
  user?: {
    roles: Role[];
  };
}
