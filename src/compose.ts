import { getContext } from "./context";
import type { Middleware } from "./type";

export const middlewareCompose = (middlewares: Middleware[]) => {
  const compose = (index: number) => async (req: Request) => {
    getContext(req);
    const res = await middlewares[index](
      req,
      middlewares[index + 1]
        ? compose(index + 1)
        : async () => new Response(undefined, { status: 404 })
    );
    return res ?? new Response(undefined, { status: 404 });
  };
  return compose(0);
};
