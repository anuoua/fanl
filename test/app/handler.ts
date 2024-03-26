import { useContext } from "../../src/context";

export function POST(req: Request) {
  const ctx = useContext();
  return new Response(ctx.user);
}

export default () => {
  return new Response("default");
};
