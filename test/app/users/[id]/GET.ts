import { useParams } from "../../../../src/compose";

export default async () => {
  const params = useParams<{ id: string }>();
  return new Response(params.id)
}