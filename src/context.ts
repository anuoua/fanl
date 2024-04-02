import type { Context } from "./type";

const ctxMap = new WeakMap();

let ctx: any;

export const setCtxMap = <T extends Context>(req: Request, data: T) => {
  ctxMap.set(req, data);
};

export const getCtxMap = <T extends Context>(req: Request) => {
  return (ctx = ctxMap.get(req) as T);
};

export const getParams = <T = Record<string, any>>() => {
  return ctx.params as T;
};

export const getContext = <C = Context>() => ctx as C;
