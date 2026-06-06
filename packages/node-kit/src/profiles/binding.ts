import type { WireBinding } from "@station/contracts";
import type { WireMsg } from "../transport";
import { msgChannel } from "./model";

/* ============================================================
   WireBinding(IF-P 페이로드 IDL) 조회 — ProtocolModel.encode 가 선언된 frameId/topic/
   바이트 레이아웃을 따르게 한다. 바인딩 있으면 *실 와이어*(CAN 8B 바이너리 1프레임 등),
   없으면 모델 휴리스틱(JSON) 폴백.
   ============================================================ */

export type BindingEntry = NonNullable<WireBinding["signals"]>[number];

/** 메시지에 해당하는 바인딩 엔트리(channel/verb/code 매칭). */
export function entryFor(binding: WireBinding | undefined, msg: WireMsg): BindingEntry | undefined {
  if (!binding) return undefined;
  const key = msgChannel(msg);
  if (key === undefined) return undefined;
  if (msg.t === "signal") return binding.signals?.find((e) => e.channel === key);
  if (msg.t === "command") return binding.commands?.find((e) => e.verb === key);
  if (msg.t === "event") return binding.events?.find((e) => e.code === key);
  return undefined;
}

const TYPE_BYTES: Record<string, number> = { u8: 1, i8: 1, bool: 1, u16: 2, i16: 2, f32: 4, u32: 4, i32: 4 };

/** 바인딩 엔트리의 실 페이로드 바이트(필드 레이아웃 합, dlc 우선). */
export function payloadBytes(entry: BindingEntry): number {
  if (typeof entry.dlc === "number") return entry.dlc;
  if (entry.fields?.length) return entry.fields.reduce((n, f) => Math.max(n, f.offset + (TYPE_BYTES[f.type] ?? 1)), 0);
  return 8;
}
