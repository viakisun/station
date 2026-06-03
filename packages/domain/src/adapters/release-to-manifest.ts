/* ============================================================
   RELEASE.modules + Capability/Protocol → 표준 ModuleManifest[] (비파괴 투영)
   가공 벤더명 → owner_org(via vendorToOrg), 모듈 → 부착 노드.
   ============================================================ */
import type { ModuleManifest } from "@station/contracts";
import { vendorToOrg } from "@station/contracts";
import { RELEASE } from "../data/release";
import { capabilityProfiles } from "../data/mockups2";
import { moduleNode } from "./modules-to-nodes";
import { capabilityToCommands } from "./capability-to-command";

const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const transport = (proto: string): "MQTT" | "ROS2" | "DDS" =>
  proto.includes("MQTT") ? "MQTT" : proto.includes("ROS") ? "ROS2" : "DDS";

const orgShort = (org: string): string => org.replace(/^ORG-/, "").toLowerCase();

export function releaseToManifests(): ModuleManifest[] {
  return RELEASE.modules.map((m) => {
    const owner = vendorToOrg(m.vendor) ?? "ORG-META";
    const man: ModuleManifest = {
      manifestId: `${orgShort(owner)}.module.${slug(m.type)}.v1`,
      moduleType: slug(m.type),
      version: "v1",
      ownerOrg: owner,
      vendorAlias: m.vendor,
      legacyModuleId: m.id,
      attachesToNode: moduleNode(m.id),
      protocol: { transport: transport(m.proto), profileRef: m.proto },
      signals: (capabilityProfiles[m.id]?.telemetry ?? []).map((t) => t.channel),
      commands: capabilityToCommands(m.id).map((c) => c.verb),
      firmwareRef: `FW-${m.id.replace("MOD-", "")}-${m.fw}`,
    };
    return man;
  });
}
