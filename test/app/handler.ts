import { useContext } from "../../src/compose"

export function POST() {
  const ctx = useContext();
  return new Response(ctx.user);
}

export default () => {

}