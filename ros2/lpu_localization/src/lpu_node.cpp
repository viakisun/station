// ============================================================
// LPU 측위 노드 — 대동로보틱스. ROS2/DDS (IF-P-LPU).
//   퍼블리시: machine.localization.{pose,map_match,confidence} (BEST_EFFORT/RELIABLE)
//   서브스크라이브: localization.relocalize (RELIABLE)
//   결정적 측위 시뮬: 신뢰도 회복 + waypoint 추종(사인 경로). 본 모듈은 clean 구현.
// ============================================================
#include <chrono>
#include <cmath>
#include <memory>
#include <string>

#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/float64.hpp"
#include "std_msgs/msg/string.hpp"
#include "geometry_msgs/msg/pose2_d.hpp"

using namespace std::chrono_literals;

namespace {
constexpr double kConfidenceFloor = 0.35;
constexpr double kConfidenceTarget = 0.97;
}  // namespace

class LpuNode : public rclcpp::Node {
 public:
  LpuNode() : Node("lpu_localization") {
    // 안전/신뢰성 토픽은 RELIABLE, 고빈도 pose 는 BEST_EFFORT (IF-P-LPU QoS 정합).
    auto best_effort = rclcpp::QoS(rclcpp::KeepLast(10)).best_effort();
    auto reliable = rclcpp::QoS(rclcpp::KeepLast(10)).reliable();

    pose_pub_ = create_publisher<geometry_msgs::msg::Pose2D>("rt/localization/pose", best_effort);
    match_pub_ = create_publisher<std_msgs::msg::Float64>("rt/localization/map_match", best_effort);
    conf_pub_ = create_publisher<std_msgs::msg::Float64>("rt/localization/confidence", reliable);
    hb_pub_ = create_publisher<std_msgs::msg::String>("rt/heartbeat/lpu", reliable);

    relocalize_sub_ = create_subscription<std_msgs::msg::String>(
        "rt/localization/relocalize", reliable,
        [this](const std_msgs::msg::String::SharedPtr msg) { on_relocalize(msg->data); });

    timer_ = create_wall_timer(50ms, [this]() { tick(); });   // 20Hz
    hb_timer_ = create_wall_timer(1s, [this]() { heartbeat(); });
  }

 private:
  void on_relocalize(const std::string & reason) {
    RCLCPP_INFO(get_logger(), "relocalize requested: %s", reason.c_str());
    confidence_ = kConfidenceFloor;  // 재측위 → 신뢰도 리셋 후 회복
  }

  void tick() {
    t_ += 0.05;
    // waypoint 추종: 사인 경로
    pose_x_ = t_ * 0.6;
    pose_y_ = 0.5 * std::sin(t_ * 0.4);
    theta_ = std::atan2(0.5 * 0.4 * std::cos(t_ * 0.4), 0.6);
    // 신뢰도 점근 회복
    confidence_ += (kConfidenceTarget - confidence_) * 0.05;
    map_match_ = std::min(1.0, confidence_ + 0.01);

    geometry_msgs::msg::Pose2D p;
    p.x = pose_x_;
    p.y = pose_y_;
    p.theta = theta_;
    pose_pub_->publish(p);

    std_msgs::msg::Float64 m;
    m.data = map_match_;
    match_pub_->publish(m);

    std_msgs::msg::Float64 c;
    c.data = confidence_;
    conf_pub_->publish(c);
  }

  void heartbeat() {
    std_msgs::msg::String hb;
    hb.data = "lpu";
    hb_pub_->publish(hb);
  }

  rclcpp::Publisher<geometry_msgs::msg::Pose2D>::SharedPtr pose_pub_;
  rclcpp::Publisher<std_msgs::msg::Float64>::SharedPtr match_pub_;
  rclcpp::Publisher<std_msgs::msg::Float64>::SharedPtr conf_pub_;
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr hb_pub_;
  rclcpp::Subscription<std_msgs::msg::String>::SharedPtr relocalize_sub_;
  rclcpp::TimerBase::SharedPtr timer_;
  rclcpp::TimerBase::SharedPtr hb_timer_;

  double t_ = 0.0, pose_x_ = 0.0, pose_y_ = 0.0, theta_ = 0.0;
  double confidence_ = kConfidenceFloor, map_match_ = kConfidenceFloor;
};

int main(int argc, char ** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<LpuNode>());
  rclcpp::shutdown();
  return 0;
}
