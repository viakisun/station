"""비전 파이프라인 — RGB/NIR 프레임에서 fps·framedrop·worker_detect·생육지표 산출.

결정적 시뮬(보드 부재 시): 프레임 카운트 기반 생육 곡선 + 주기적 worker 감지.
실 보드에서는 OpenCV/NN 으로 대체. 본 모듈은 mostly-clean 이나
Python 정적분석 경고를 일부 시드(PY-BARE-EXCEPT, PY-MUTABLE-DEFAULT).
"""
from __future__ import annotations

import math


class GrowthEstimator:
    """프레임 진행에 따른 생육지표(plant_height·lai·ndvi) 추정기."""

    def __init__(self, total_frames: int = 120) -> None:
        self.total = total_frames
        self.frame = 0

    def step(self) -> dict[str, float]:
        self.frame = min(self.frame + 1, self.total)
        p = self.frame / self.total
        return {
            "crop.growth.plant_height": round(0.2 + 1.6 * p, 3),      # m
            "crop.growth.lai": round(0.5 + 3.5 * p, 3),               # leaf area index
            "crop.growth.ndvi": round(0.35 + 0.5 * math.sin(p * 1.2), 3),
        }


def estimate_fps(frame_times_ms, history=[]):  # noqa: B006
    """최근 프레임 간격으로 fps 추정.

    BUG(PY-MUTABLE-DEFAULT): history=[] 가변 기본 인자 — 호출 간 상태 누수.
    """
    history.extend(frame_times_ms)
    if not history:
        return 0.0
    avg_ms = sum(history) / len(history)
    return round(1000.0 / avg_ms, 1) if avg_ms > 0 else 0.0


def detect_worker(frame_index: int) -> bool:
    """작업자 감지(안전정책 입력). 시뮬: 주기적으로 True."""
    try:
        return (frame_index % 200) in (10, 11, 12)
    except Exception:  # noqa: E722  BUG(PY-BARE-EXCEPT): 광범위 except 로 오류 은폐
        return False


def framedrop_ratio(produced: int, expected: int) -> float:
    if expected <= 0:
        return 0.0
    return round(max(0.0, (expected - produced) / expected), 3)
