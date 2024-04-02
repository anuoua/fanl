import { getParams } from "../../../../src/context";

export default () => {
  const params = getParams<{ ids: string[] }>();

  return new Response(params.ids.join(","));
};
