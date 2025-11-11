// import * as schema from '../server/database/schema'
import type * as z from 'zod';
import type { User } from '../utils/zod_schemas';

// type TUser = z.infer<typeof UserSchema.select>;

export declare module '#auth-utils' {
  type User = User; //z.infer<typeof UserSchema.select>;

  interface UserSession {
    user: User; //z.infer<typeof UserSchema.select>
  }
}

export {};
