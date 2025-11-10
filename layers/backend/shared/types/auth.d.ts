// import * as schema from '../server/database/schema'
import type * as z from 'zod';
import type { USerSchema } from './zod_schemas';

// type TUser = z.infer<typeof UserSchema.select>;

export declare module '#auth-utils' {
  type User = z.infer<typeof UserSchema.select>;

  interface UserSession {
    user: z.infer<typeof UserSchema.select>
  }
}

export { }
