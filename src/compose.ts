import { getCtxMap } from "./context";
import type { Middleware } from "./type";

export const innerCompose = (middlewares: Middleware[]) => {
  const dispatch = (index: number) => (req: Request) => {
    getCtxMap(req);
    return middlewares[index](
      req,
      middlewares[index + 1] ? dispatch(index + 1) : undefined!
    );
  };
  return dispatch(0);
};

export const compose = (...middlewares: Middleware[]) => {
  const dispatch =
    (index: number): Middleware =>
    (req, next) => {
      return middlewares[index](req, (req: Request) =>
        middlewares[index + 1] ? dispatch(index + 1)(req, next) : next(req)
      );
    };
  return dispatch(0);
};
