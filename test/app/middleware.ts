import { compose } from "../../src";
import { useContext } from "../../src/context";
import type { Middleware } from "../../src/type";

const userMiddleware: Middleware = async (
  req: Request,
  next: (req: Request) => Promise<Response>
) => {
  const ctx = useContext();
  ctx.user = "root";
  return next(req);
};

const tokenMiddleware: Middleware = async (
  req: Request,
  next: (req: Request) => Promise<Response>
) => {
  const ctx = useContext();
  ctx.token = "token";
  return next(req);
};

export default compose(userMiddleware, tokenMiddleware);
