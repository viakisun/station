"""Telemetry 게이트웨이 — env.greenhouse.* 신호를 MQTT 로 업링크 (IF-P-TEL).

토픽: station/{site}/{robot}/tlm/env/* (QoS1, retain). 명령: telemetry.uplink.flush.
오프라인 시 버퍼링 후 재연결에 flush. 본 모듈은 clean 구현(감사 통과 대상).
"""
from __future__ import annotations

from collections import deque
from dataclasses import dataclass

# wire.telemetry.mqtt.json 과 정합
TOPIC_TMPL = {
    "env.greenhouse.temperature": "station/{site}/{robot}/tlm/env/temperature",
    "env.greenhouse.humidity": "station/{site}/{robot}/tlm/env/humidity",
    "env.greenhouse.co2": "station/{site}/{robot}/tlm/env/co2",
    "machine.telemetry.cloud_connected": "station/{site}/{robot}/tlm/cloud_connected",
}
QOS1 = 1


@dataclass
class Sample:
    channel: str
    value: float
    ts: str


class TelemetryGateway:
    def __init__(self, site: str, robot: str, max_buffer: int = 5000) -> None:
        self.site = site
        self.robot = robot
        self.connected = False
        self.buffer: deque[Sample] = deque(maxlen=max_buffer)

    def topic_for(self, channel: str) -> str | None:
        tmpl = TOPIC_TMPL.get(channel)
        if tmpl is None:
            return None
        return tmpl.format(site=self.site, robot=self.robot)

    def publish(self, s: Sample) -> bool:
        """연결 시 즉시 발행, 아니면 버퍼링(QoS1·retain 은 보드 client)."""
        topic = self.topic_for(s.channel)
        if topic is None:
            return False  # 미선언 채널 — 업링크 거부(IF-P 위반 방지)
        if not self.connected:
            self.buffer.append(s)
            return False
        self._send(topic, s.value)
        return True

    def on_reconnect(self) -> int:
        """재연결 시 버퍼 flush — 전송 건수 반환."""
        self.connected = True
        n = 0
        while self.buffer:
            s = self.buffer.popleft()
            topic = self.topic_for(s.channel)
            if topic is not None:
                self._send(topic, s.value)
                n += 1
        return n

    def flush(self) -> int:
        """telemetry.uplink.flush 명령 핸들러."""
        return self.on_reconnect() if self.connected else 0

    def _send(self, topic: str, value: float) -> None:
        # 보드: client.publish(topic, payload, qos=QOS1, retain=True)
        _ = (topic, value, QOS1)


def main() -> None:
    gw = TelemetryGateway(site="SITE-GIMJE-01", robot="RBT-THIN-0001")
    gw.publish(Sample("env.greenhouse.temperature", 24.6, "2026-06-07T09:00:00Z"))
    gw.on_reconnect()


if __name__ == "__main__":
    main()
