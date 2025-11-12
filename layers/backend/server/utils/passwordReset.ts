import { useDrizzle, tables, eq, and, or, gt, lt } from './drizzle';

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
  // Generate a random 32-byte token and convert to hex
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

/**
 * Create a password reset token for a user
 * Token expires in 1 hour by default
 */
export async function createPasswordResetToken(
  userId: string,
  expiresInMinutes = 60,
) {
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  const resetToken = await useDrizzle()
    .insert(tables.passwordResetTokens)
    .values({
      userId,
      token,
      expiresAt,
      used: false,
    })
    .returning()
    .get();

  return resetToken;
}

/**
 * Find a valid (unused and not expired) password reset token
 */
export async function findValidResetToken(token: string) {
  const now = new Date();

  const resetToken = await useDrizzle()
    .select()
    .from(tables.passwordResetTokens)
    .where(
      and(
        eq(tables.passwordResetTokens.token, token),
        eq(tables.passwordResetTokens.used, false),
        // expiresAt must be in the future (greater than now)
        gt(tables.passwordResetTokens.expiresAt, now),
      ),
  ).get();
    
// const _r = await useDrizzle().query.passwordResetTokens.findFirst({
//     where: and(
//         eq(tables.passwordResetTokens.token, token),
//         eq(tables.passwordResetTokens.used, false),
//         lt(tables.passwordResetTokens.expiresAt, new Date())
//     )
// })
//     console.log(_r)

  return resetToken;
}

/**
 * Mark a reset token as used
 */
export async function markTokenAsUsed(tokenId: string) {
  return useDrizzle()
    .update(tables.passwordResetTokens)
    .set({ used: true })
    .where(eq(tables.passwordResetTokens.id, tokenId))
    .returning()
    .get();
}

/**
 * Delete all expired or used tokens for a user
 */
export async function cleanupUserResetTokens(userId: string) {
  const now = new Date();

  return useDrizzle()
    .delete(tables.passwordResetTokens)
    .where(
      and(
        eq(tables.passwordResetTokens.userId, userId),
        or(
          eq(tables.passwordResetTokens.used, true),
          gte(tables.passwordResetTokens.expiresAt, now),
        ),
      ),
    )
    .run();
}

/**
 * Delete all reset tokens for a user (e.g., when password is successfully reset)
 */
export async function deleteAllUserResetTokens(userId: string) {
  return useDrizzle()
    .delete(tables.passwordResetTokens)
    .where(eq(tables.passwordResetTokens.userId, userId))
    .run();
}
