import { ActionGuideScreen } from "../../_screens/ActionGuideScreen";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ActionGuideScreen incidentId={id} />;
}
