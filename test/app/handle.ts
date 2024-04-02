import { useContext } from "../../src/context";

export function POST(req: Request) {
  const ctx = useContext();
  return new Response(`${ctx.user}:${ctx.token}`);
}

export default () => {
  return new Response("default");
};
