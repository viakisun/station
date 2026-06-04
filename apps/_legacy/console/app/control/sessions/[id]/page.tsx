import { SessionScreen } from "../../_screens/SessionScreen";

export default async function P({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionScreen sessionId={id} />;
}
