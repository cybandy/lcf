import { useValidatedParams, z } from 'h3-zod';
export default eventHandler(async (event) => {
  await requireUserSession(event);

  const { pathname } = await useValidatedParams(
    event,
    z.object({
      pathname: z.string(),
    }),
  );

  return hubBlob().del(pathname);
});
