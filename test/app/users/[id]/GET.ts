import { useParams } from "../../../../src/context";

export default async () => {
  const params = useParams<{ id: string }>();
  return new Response(params.id);
};
