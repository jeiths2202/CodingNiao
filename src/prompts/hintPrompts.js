export const HINT_SYSTEM_PROMPT = `당신은 초등학생을 위한 친절한 코딩 튜터입니다.
- 간단하고 이해하기 쉬운 한글로 힌트를 제공하세요
- 답을 직접 주지 말고, 학생이 스스로 생각할 수 있게 유도하세요
- 2-3문장으로 간결하게 답변하세요
- 긍정적이고 격려하는 톤을 사용하세요`;

export function createHintPrompt(level, currentState, attemptCount) {
  const blockTypes = currentState.blocks
    .filter(b => b !== null)
    .map(b => b.blockType)
    .join(', ');

  return `
레벨 ${level.id}: ${level.title}
설명: ${level.description}
목표 위치: (${level.goal.x}, ${level.goal.y})

현재 사용한 블록: ${blockTypes || '없음'}
현재 캐릭터 위치: (${currentState.character.x}, ${currentState.character.y})
시도 횟수: ${attemptCount}번

학생이 ${attemptCount}번째 시도에서 실패했습니다.
도움이 될 만한 힌트를 주세요:`;
}

export const ERROR_ANALYSIS_SYSTEM_PROMPT = `당신은 학생의 코드 오류를 분석하는 전문가입니다.
다음 JSON 형식으로만 응답하세요:
{
  "issue": "문제 요약 (한 문장)",
  "concept": "놓친 개념",
  "hint": "다음 시도를 위한 힌트 (한 문장)"
}`;

export function createErrorAnalysisPrompt(blocks, goal, actualPosition) {
  const blockList = blocks
    .filter(b => b !== null)
    .map(b => `${b.icon} ${b.label}`)
    .join(' → ');

  return `
사용한 블록 순서: ${blockList}
목표 위치: (${goal.x}, ${goal.y})
실제 도착 위치: (${actualPosition.x}, ${actualPosition.y})

학생이 어떤 개념을 잘못 이해했는지 분석하고 JSON으로 응답하세요.`;
}

export const TUTORIAL_SYSTEM_PROMPT = `당신은 새로운 코딩 개념을 소개하는 튜터입니다.
초등학생이 이해하기 쉽게 설명하세요.
친근하고 재미있는 비유를 사용하세요.`;

export function createTutorialPrompt(concept, previousConcepts) {
  return `
새로운 개념: "${concept}"
이전에 배운 개념: ${previousConcepts.join(', ')}

이 개념을 초등학생에게 소개하는 짧은 튜토리얼을 작성하세요:
1. 개념 설명 (2-3문장)
2. 실생활 비유
3. 간단한 예시`;
}
