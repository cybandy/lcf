import type { UserSessionComposable } from '#auth-utils';
import type * as z from 'zod';

// type User = z.infer<typeof UserSchema.select>;

interface MyUserSessionComposable extends UserSessionComposable {
  /**
   * Computed indicating if the auth session is ready
   */
  ready: ComputedRef<boolean>
  /**
   * Computed indicating if the user is logged in.
   */
  loggedIn: ComputedRef<boolean>
  /**
   * The user object if logged in, null otherwise.
   */
  user: ComputedRef<User>
  /**
   * The session object.
   */
  session: Ref<User>
  /**
   * Fetch the user session from the server.
   */
  fetch: () => Promise<void>
  /**
   * Clear the user session and remove the session cookie.
   */
  clear: () => Promise<void>
  /**
   * Open the OAuth route in a popup that auto-closes when successful.
   */
  openInPopup: (
    route: string,
    size?: { width?: number, height?: number },
  ) => void
}

export const useMyUserSession = () => {
  return useUserSession() as MyUserSessionComposable;
};
