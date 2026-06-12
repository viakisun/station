"""VPU ROS2 노드 — 비전 신호/명령 브리지 (IF-P-VPU).

퍼블리시: machine.vision.{fps,framedrop,worker_detected} + crop.growth.* + heartbeat.vpu
서브스크라이브: vision.capture.{start,stop} · vision.calibrate
이벤트: disease.suspected
"""
from __future__ import annotations

import time

from .vision import GrowthEstimator, detect_worker, estimate_fps, framedrop_ratio

# IF-P-VPU 토픽 매핑(wire.vpu.ros2.json 과 정합)
TOPICS = {
    "fps": "rt/vision/fps",
    "framedrop": "rt/vision/framedrop",
    "worker_detected": "rt/vision/worker_detected",
    "capture": "rt/vision/capture",
    "calibrate": "rt/vision/calibrate",
    "disease": "rt/vision/disease",
    "heartbeat": "rt/heartbeat/vpu",
}


class VpuNode:
    """rclpy.Node 래퍼(보드). 여기서는 결정적 루프로 거동을 재현."""

    def __init__(self) -> None:
        self.scanning = False
        self.frame = 0
        self.growth = GrowthEstimator()

    def on_command(self, verb: str) -> None:
        if verb == "vision.capture.start":
            self.scanning = True
        elif verb == "vision.capture.stop":
            self.scanning = False
        elif verb == "vision.calibrate":
            self.growth = GrowthEstimator()

    def tick(self) -> dict[str, float | bool]:
        """30Hz 가정 1틱 — 신호 dict 반환(퍼블리시는 보드 rclpy)."""
        self.frame += 1
        out: dict[str, float | bool] = {
            "machine.vision.fps": estimate_fps([33.0]),
            "machine.vision.framedrop": framedrop_ratio(self.frame, self.frame + 1),
            "machine.vision.worker_detected": detect_worker(self.frame),
        }
        if self.scanning:
            out.update(self.growth.step())
        return out


def main() -> None:
    node = VpuNode()
    node.on_command("vision.capture.start")
    for _ in range(5):
        _ = node.tick()
        time.sleep(0.01)


if __name__ == "__main__":
    main()
