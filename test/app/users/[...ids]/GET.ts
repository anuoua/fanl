import { useParams } from "../../../../src/compose"

export default () => {
  const params = useParams<{ ids: string[] }>();

  return new Response(params.ids.join(','))
}