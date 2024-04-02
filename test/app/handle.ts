import { getContext } from "../../src/context";

export function POST(req: Request) {
  const ctx = getContext();
  return new Response(`${ctx.user}:${ctx.token}`);
}

export default () => {
  return new Response("default");
};
