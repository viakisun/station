/* AUTO-GENERATED from schema/ by scripts/codegen.mjs — DO NOT EDIT.
   재생성: pnpm --filter @station/contracts codegen */

/**
 * IF-P 페이로드 IDL — 한 인터페이스의 채널/verb 를 매체 인코딩에 매핑. CAN 은 frameId+바이트 레이아웃, ROS2/DDS/MQTT 는 topic+QoS. ProfiledTransport 가 소비해 실 프레이밍 산출, 실 드라이버(socketcan/rclcpp/mosquitto)는 동일 정의를 코드젠/참조.
 */
export interface WireBinding {
  /**
   * 예 IF-P-MCU
   */
  interfaceId: string;
  transport: "MQTT" | "ROS2" | "DDS" | "CAN" | "SERIAL" | "WS";
  signals?: Entry[];
  commands?: Entry[];
  events?: Entry[];
}
/**
 * 한 채널/verb/code 의 와이어 인코딩. CAN: frameId·dlc·fields. ROS2/DDS/MQTT: topic·msgType·qos.
 */
export interface Entry {
  /**
   * signal 채널(signals 엔트리)
   */
  channel?: string;
  /**
   * command verb(commands 엔트리)
   */
  verb?: string;
  /**
   * event code(events 엔트리)
   */
  code?: string;
  /**
   * CAN 29-bit 확장 ID. 예 0x18FF5001
   */
  frameId?: string;
  /**
   * CAN/serial 데이터 길이(byte)
   */
  dlc?: number;
  /**
   * CAN/serial 바이트 레이아웃. 실 노드는 이대로 패킹(JSON 금지).
   */
  fields?: {
    name: string;
    /**
     * byte offset
     */
    offset: number;
    type: "u8" | "i8" | "u16" | "i16" | "u32" | "i32" | "f32" | "bool";
    /**
     * 원값 = raw * scale
     */
    scale?: number;
    unit?: string;
  }[];
  /**
   * ROS2/DDS(rt/…) 또는 MQTT(station/…) 토픽
   */
  topic?: string;
  /**
   * ROS2/DDS 메시지 타입. 예 station_msgs/Signal
   */
  msgType?: string;
  /**
   * DDS RELIABLE/BEST_EFFORT 또는 MQTT QoS0/1/2
   */
  qos?: string;
  /**
   * MQTT retain
   */
  retain?: boolean;
}
