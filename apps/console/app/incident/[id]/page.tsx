import { IncidentDetail } from "../_screens/IncidentDetail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IncidentDetail incidentId={id} />;
}
