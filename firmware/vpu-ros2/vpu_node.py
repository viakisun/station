#!/usr/bin/env python3
# ============================================================
# VPU 노드 — Jetson Orin Nano · ROS2(rclpy) · 생육분석.
# 역할(금지 포함): RGB/NIR 수집 · 생육분석 추론(초장·LAI·NDVI·병해 의심) ·
#   image quality · scan result event. 모터/안전 직접제어 금지(=MCU/ACU 경유).
#   출처: docs/architecture/sdv-crop-growth-rig.md §02.
#
# 계약(시뮬 nodes/vpu/src/index.ts 와 동일):
#   Signal   crop.growth.lai · crop.growth.ndvi · vision.fps  (rt/crop/growth)
#   Command  vision.capture · scan · calibrate                (rt/vision/capture)
#   Event    disease.suspected                                (rt/disease/suspected)
#   QoS      텔레메트리 RELIABLE(분석 결과는 손실 불가)
#
# 빌드 가능한 완성품 아님 — TODO 가 실구현(카메라·CUDA 추론) 지점.
# ============================================================
import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, DurabilityPolicy

# TODO: 실제로는 station_msgs/Signal 커스텀 메시지 사용. 골격은 std_msgs 로 형태만.
from std_msgs.msg import String  # noqa: F401  (placeholder for Signal msg)


RELIABLE = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.RELIABLE,
    durability=DurabilityPolicy.VOLATILE,
)


class VpuNode(Node):
    def __init__(self) -> None:
        super().__init__("vpu_node")
        # 텔레메트리 발행(rt/crop/growth) — RELIABLE.
        self.pub_growth = self.create_publisher(String, "crop/growth", RELIABLE)
        self.pub_disease = self.create_publisher(String, "disease/suspected", RELIABLE)
        # 명령 구독(rt/vision/capture).
        self.create_subscription(String, "vision/capture", self.on_command, RELIABLE)
        # 5Hz 생육분석 발행.
        self.create_timer(0.2, self.tick)
        self.get_logger().info("VPU up — Jetson Orin · ROS2 RELIABLE")

    def tick(self) -> None:
        # TODO: 카메라 프레임 캡처 → CUDA 생육분석 추론 → 실 값.
        ndvi, lai, fps = 0.81, 3.1, 12.0
        self.pub_growth.publish(String(data=f"crop.growth.ndvi={ndvi};lai={lai};vision.fps={fps}"))
        # 병해 의심 시 이벤트(예시 조건).
        if ndvi < 0.2:
            self.pub_disease.publish(String(data="disease.suspected"))

    def on_command(self, msg: "String") -> None:
        # TODO: vision.capture/scan/calibrate 처리 + 3단계 ACK(rt/.../ack).
        self.get_logger().info(f"command: {msg.data}")


def main() -> None:
    rclpy.init()
    node = VpuNode()
    try:
        rclpy.spin(node)
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
