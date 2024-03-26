import { useParams } from "../../../../src/context";

export default () => {
  const params = useParams<{ ids: string[] }>();

  return new Response(params.ids.join(","));
};
