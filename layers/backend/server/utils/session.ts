import type { H3Event } from 'h3';
import type { User, UserSessionRequired } from '#auth-utils';
import type * as z from 'zod';

export async function updateUserSession(
  event: H3Event,
  user: UserWithRoles,
) {
  await replaceUserSession(event, { user });
}

interface myUserSessionRequired extends UserSessionRequired {
  user: UserWithRoles
}
export async function myRequireUserSession(
  event: H3Event,
  opts = { statusCode: 401, message: 'Unauthorized' },
) {
  return requireUserSession(event, opts) as Promise<myUserSessionRequired>;
}
