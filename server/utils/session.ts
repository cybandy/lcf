import type { H3Event } from 'h3';
import type { UserSessionRequired } from '#auth-utils';
import type { User } from '~~/shared/utils/zod_schemas';
import type * as z from 'zod';

type TUser = Omit<User, 'password' | 'githubToken' | 'googleToken'>
export interface AuthUserWithRoles extends TUser { roles?: Array<{ id: number, name: string }> }

export async function updateUserSession(
  event: H3Event,
  user: AuthUserWithRoles,
) {
  await replaceUserSession(event, { user });
}

interface myUserSessionRequired extends UserSessionRequired {
  user: AuthUserWithRoles
}
export async function myRequireUserSession(
  event: H3Event,
  opts = { statusCode: 401, message: 'Unauthorized' },
) {
  return requireUserSession(event, opts) as Promise<myUserSessionRequired>;
}
