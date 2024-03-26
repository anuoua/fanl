import { build, match } from "@app-route/core";
import { resolve } from "@app-route/resolve-restful";
import { setContext } from "./context";
import { middlewareCompose } from "./compose";
import type { METHODS, Middleware } from "./type";

export const createFanlFetch = async (appRoute: string) => {
  const root = await build(appRoute, {
    resolve,
  });

  const fetch = async (req: Request, context: Record<string, any> = {}) => {
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
        ? await (async () => {
            const handlerModule = await import(node.resolved!.handler!);
            return handlerModule[method] ?? handlerModule.default;
          })()
        : undefined;

      if (node.resolved?.[method]) {
        endPoint = (await import(node.resolved[method]!)).default;
      }

      endPoint && awaitMiddlewares.push(endPoint);
    }

    setContext(req, { params, ...context });

    return middlewareCompose(awaitMiddlewares)(req);
  };

  return fetch;
};
