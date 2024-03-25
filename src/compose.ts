import { getContext } from "./context";

export type Middleware = (req: Request, next: Middleware) => Promise<Response>;

export type METHODS =
  | "GET"
  | "POST"
  | "DELETE"
  | "PUT"
  | "OPTIONS"
  | "HEAD"
  | "PATCH"
  | "CONNECT"
  | "TRACE";

let ctx: any;

export const useParams = <T = Record<string, any>>() => {
  return ctx.params as T;
}

export const useContext = <C = any>() => ctx as C;

export const middlewareCompose = (middlewares: Middleware[]) => {
  const compose = (index: number) => async (req: Request) => {
    ctx = getContext(req);
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