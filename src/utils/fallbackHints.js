// AI 없이 사용할 수 있는 기본 힌트 시스템
export const fallbackHints = {
  1: [
    "앞으로 이동 블록을 사용해보세요",
    "목표까지 몇 칸인지 세어보세요",
    "앞으로 블록을 2번 사용하면 돼요"
  ],
  2: [
    "먼저 방향을 바꿔야 해요",
    "왼쪽으로 회전한 후 앞으로 가보세요",
    "회전 블록을 사용하면 방향을 바꿀 수 있어요"
  ],
  3: [
    "계단을 오르듯이 움직여보세요",
    "앞으로 가고, 위로 가고를 반복해보세요",
    "회전과 이동을 번갈아 사용하세요"
  ],
  4: [
    "장애물을 피해서 돌아가야 해요",
    "벽을 만나면 다른 길을 찾아보세요",
    "위나 아래로 돌아가는 경로를 생각해보세요"
  ],
  5: [
    "같은 동작을 여러 번 하고 있나요?",
    "반복 블록을 사용하면 더 간단해져요",
    "정사각형을 그리려면 같은 동작을 4번 해야 해요"
  ]
};

export function getFallbackHint(levelId, attemptCount) {
  const hints = fallbackHints[levelId] || ["블록의 순서를 다시 확인해보세요"];

  // 시도 횟수에 따라 점점 더 구체적인 힌트 제공
  const hintIndex = Math.min(attemptCount - 1, hints.length - 1);
  return hints[hintIndex];
}

export function getBasicErrorAnalysis(blocks, goal, actualPosition) {
  const deltaX = goal.x - actualPosition.x;
  const deltaY = goal.y - actualPosition.y;

  if (deltaX === 0 && deltaY === 0) {
    return "목표에 도달했어요!";
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0
      ? "오른쪽으로 더 가야 해요"
      : "왼쪽으로 더 가야 해요";
  } else {
    return deltaY > 0
      ? "아래로 더 가야 해요"
      : "위로 더 가야 해요";
  }
}
