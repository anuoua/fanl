import { useContext } from "../../src/context";

export default async (
  req: Request,
  next: (req: Request) => Promise<Response>
) => {
  const ctx = useContext();
  ctx.user = "root";
  return next(req);
};
