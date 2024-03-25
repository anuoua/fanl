const context = new WeakMap();

export const setContext = <T>(req: Request, data: T) => {
  context.set(req, data);
}

export const getContext = <T = unknown>(req: Request) => {
  return context.get(req) as T;
}