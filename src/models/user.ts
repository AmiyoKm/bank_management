import { User as PrismaUser, Role } from '../../generated/prisma/client.js';

export { Role };

export type User = Omit<PrismaUser, 'password'>;

export interface Password {
  hash: string;
}
