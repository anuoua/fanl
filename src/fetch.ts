import { build, match } from "@app-route/core";
import { resolve } from "@app-route/resolve-restful";
import { setContext } from "./context";
import { middlewareCompose, type METHODS, type Middleware } from "./compose";

export const createFetch = async (appRoute: string) => {
  const root = await build(appRoute, {
    resolve,
  });

  const fetch = async (req: Request) => {
    const url = new URL(req.url);
    const [node, params] = match(url.pathname, root);
  
    let iNode: typeof node | undefined = node;
  
    const middlewares: string[] = iNode.resolved?.middleware
      ? [iNode.resolved.middleware]
      : [];
  
    while ((iNode = iNode?.parent)) {
      iNode.resolved?.middleware && middlewares.push(iNode.resolved.middleware);
    }
  
    middlewares.reverse();
  
    const awaitMiddlewares: Middleware[] = (
      await Promise.all(middlewares.map((middleware) => import(middleware)))
    ).map((middleware) => middleware.default);
  
    if (node.resolved) {
      const method = req.method.toUpperCase() as METHODS;
  
      let endPoint: Middleware | undefined = node.resolved.handler
        ? (await import(node.resolved.handler))[method]
        : undefined;
  
      if (node.resolved?.[method]) {
        endPoint = (await import(node.resolved[method]!)).default;
      }
  
      endPoint && awaitMiddlewares.push(endPoint);
    }
  
    setContext(req, { params });
  
    return middlewareCompose(awaitMiddlewares)(req);
  }

  return fetch;
}