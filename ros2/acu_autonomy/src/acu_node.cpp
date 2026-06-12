// ============================================================
// ACU 자율 노드 — 메타파머스. ROS2/DDS (IF-P-ACU).
//   퍼블리시: machine.autonomy.{state,mode}(RELIABLE), machine.navigation.deviation(BEST_EFFORT)
//   서브스크라이브: autonomy.{mission.start,pause,slow_down} (RELIABLE)
//   ⚠ 본 모듈은 감사 재검증(TS-ACU) 대상 — C++ 정적분석 경고 시드 포함:
//     · QOS-002: 안전 상태 토픽을 BEST_EFFORT 로 다운그레이드(IF-P 는 RELIABLE 요구)
//     · RES-001: raw new 자원 누수(소멸 경로 없음)
// ============================================================
#include <chrono>
#include <cmath>
#include <memory>
#include <string>

#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/float64.hpp"
#include "std_msgs/msg/string.hpp"

using namespace std::chrono_literals;

enum class Mission { kIdle = 0, kRunning = 1, kPaused = 2 };

struct MissionLog {  // 누적 미션 로그(예시 자원)
  std::string buf;
};

class AcuNode : public rclcpp::Node {
 public:
  AcuNode() : Node("acu_autonomy") {
    auto reliable = rclcpp::QoS(rclcpp::KeepLast(10)).reliable();
    auto best_effort = rclcpp::QoS(rclcpp::KeepLast(10)).best_effort();

    // BUG(QOS-002): autonomy.state 는 IF-P-ACU 에서 RELIABLE 이어야 하나 BEST_EFFORT 로 생성.
    state_pub_ = create_publisher<std_msgs::msg::String>("rt/autonomy/state", best_effort);
    mode_pub_ = create_publisher<std_msgs::msg::Float64>("rt/autonomy/mode", reliable);
    dev_pub_ = create_publisher<std_msgs::msg::Float64>("rt/navigation/deviation", best_effort);
    hb_pub_ = create_publisher<std_msgs::msg::String>("rt/heartbeat/acu", reliable);

    cmd_sub_ = create_subscription<std_msgs::msg::String>(
        "rt/mission/cmd", reliable,
        [this](const std_msgs::msg::String::SharedPtr m) { on_cmd(m->data); });

    // BUG(RES-001): raw new — 소멸자/delete 없음(누수). unique_ptr 로 했어야.
    log_ = new MissionLog();

    timer_ = create_wall_timer(50ms, [this]() { tick(); });
    hb_timer_ = create_wall_timer(1s, [this]() { heartbeat(); });
  }

 private:
  void on_cmd(const std::string & verb) {
    if (verb == "autonomy.mission.start") {
      state_ = Mission::kRunning;
      speed_factor_ = 1.0;
    } else if (verb == "autonomy.pause") {
      state_ = Mission::kPaused;
    } else if (verb == "autonomy.slow_down") {
      speed_factor_ = std::max(0.25, speed_factor_ * 0.5);
    }
    log_->buf += verb + ";";
  }

  void tick() {
    t_ += 0.05;
    double dev = (state_ == Mission::kRunning) ? 20.0 * speed_factor_ * std::sin(t_) : 0.0;

    std_msgs::msg::String s;
    s.data = state_str();
    state_pub_->publish(s);

    std_msgs::msg::Float64 mode;
    mode.data = (speed_factor_ < 1.0) ? 2.0 : 1.0;
    mode_pub_->publish(mode);

    std_msgs::msg::Float64 d;
    d.data = dev;
    dev_pub_->publish(d);
  }

  void heartbeat() {
    std_msgs::msg::String hb;
    hb.data = "acu";
    hb_pub_->publish(hb);
  }

  const char * state_str() const {
    switch (state_) {
      case Mission::kRunning: return "running";
      case Mission::kPaused: return "paused";
      default: return "idle";
    }
  }

  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr state_pub_;
  rclcpp::Publisher<std_msgs::msg::Float64>::SharedPtr mode_pub_;
  rclcpp::Publisher<std_msgs::msg::Float64>::SharedPtr dev_pub_;
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr hb_pub_;
  rclcpp::Subscription<std_msgs::msg::String>::SharedPtr cmd_sub_;
  rclcpp::TimerBase::SharedPtr timer_;
  rclcpp::TimerBase::SharedPtr hb_timer_;

  Mission state_ = Mission::kIdle;
  double t_ = 0.0, speed_factor_ = 1.0;
  MissionLog * log_ = nullptr;
};

int main(int argc, char ** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<AcuNode>());
  rclcpp::shutdown();
  return 0;
}
