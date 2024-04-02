import { build, match } from "@app-route/core";
import { setContext } from "./context";
import { innerCompose } from "./compose";
import { resolve } from "./resolve";
import { response404 } from "./utils";
import type { METHODS, Middleware } from "./type";

export const createFanlFetch = async (appRoute: string) => {
  const root = await build(appRoute, {
    resolve,
  });

  const fetch = async (req: Request, context: Record<string, any> = {}) => {
    const url = new URL(req.url);
    const matched = match(url.pathname, root);

    if (!matched) {
      if (root[0].resolved?.miss) {
        setContext(req, { params: {}, ...context });
        return (await import(root[0].resolved?.miss)).default(req);
      } else {
        return response404.clone();
      }
    }

    const [node, params] = matched;

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

      let endPoint: Middleware | undefined = node.resolved.handle
        ? await (async () => {
            const handlerModule = await import(node.resolved!.handle!);
            return handlerModule[method] ?? handlerModule.default;
          })()
        : undefined;

      if (node.resolved?.[method]) {
        endPoint = (await import(node.resolved[method]!)).default;
      }

      endPoint && awaitMiddlewares.push(endPoint);
    }

    setContext(req, { params, ...context });

    return (await innerCompose(awaitMiddlewares)(req)) ?? response404.clone();
  };

  return fetch;
};
