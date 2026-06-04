import { IncidentClose } from "../../_screens/IncidentClose";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IncidentClose incidentId={id} />;
}
