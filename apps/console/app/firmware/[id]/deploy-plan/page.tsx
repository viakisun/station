import { DeploymentPlan } from "../../_screens/DeploymentPlan";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DeploymentPlan firmwareId={id} />;
}
