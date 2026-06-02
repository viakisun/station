import { ReleaseApproval } from "../../_screens/ReleaseApproval";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReleaseApproval firmwareId={id} />;
}
