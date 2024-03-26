import type { Context } from "./type";

const ctxMap = new WeakMap();

let ctx: any;

export const setContext = <T extends Context>(req: Request, data: T) => {
  ctxMap.set(req, data);
};

export const getContext = <T extends Context>(req: Request) => {
  return (ctx = ctxMap.get(req) as T);
};

export const useParams = <T = Record<string, any>>() => {
  return ctx.params as T;
};

export const useContext = <C = Context>() => ctx as C;
