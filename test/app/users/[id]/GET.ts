import { getParams } from "../../../../src/context";

export default async () => {
  const params = getParams<{ id: string }>();
  return new Response(params.id);
};
