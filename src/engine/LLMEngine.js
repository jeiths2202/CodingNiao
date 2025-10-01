import { CreateMLCEngine, hasModelInCache } from "@mlc-ai/web-llm";

class LLMEngine {
  constructor(onProgress) {
    this.engine = null;
    this.isReady = false;
    this.onProgress = onProgress || (() => {});
    this.conversationHistory = [];
  }

  async checkModelInCache(modelId) {
    try {
      return await hasModelInCache(modelId);
    } catch (error) {
      console.error('캐시 확인 실패:', error);
      return false;
    }
  }

  async initialize(modelId = "Llama-3.2-3B-Instruct-q4f32_1-MLC") {
    try {
      this.onProgress({
        status: 'loading',
        message: 'AI 모델 초기화 중...',
        progress: 0,
        detail: '모델 로딩 준비 중...'
      });

      this.engine = await CreateMLCEngine(modelId, {
        initProgressCallback: (progress) => {
          console.log('WebLLM Progress:', progress); // 디버깅용

          this.onProgress({
            status: 'loading',
            message: `AI 모델 로딩: ${Math.round((progress.progress || 0) * 100)}%`,
            progress: progress.progress || 0,
            detail: progress.text || '로딩 중...'
          });
        }
      });

      this.isReady = true;
      this.currentModelId = modelId;
      this.onProgress({
        status: 'ready',
        message: 'AI 준비 완료!',
        progress: 1,
        detail: '모델이 성공적으로 로드되었습니다.'
      });

      return true;
    } catch (error) {
      console.error('LLM 초기화 실패:', error);
      this.onProgress({
        status: 'error',
        message: 'AI 로딩 실패',
        progress: 0,
        detail: error.message || '알 수 없는 오류'
      });
      return false;
    }
  }

  async deleteModel(modelId) {
    try {
      // IndexedDB에서 모델 캐시 삭제
      const databases = await indexedDB.databases();

      for (const db of databases) {
        if (db.name && db.name.includes('webllm')) {
          await new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(db.name);
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
          });
        }
      }

      // Cache API에서도 삭제
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName.includes('webllm') || cacheName.includes('mlc')) {
            await caches.delete(cacheName);
          }
        }
      }

      // 엔진 언로드
      if (this.engine) {
        await this.engine.unload();
      }

      this.isReady = false;
      this.currentModelId = null;

      return true;
    } catch (error) {
      console.error('모델 삭제 실패:', error);
      throw error;
    }
  }

  getCurrentModelId() {
    return this.currentModelId;
  }

  async chat(userMessage, systemPrompt = null, maxTokens = 150) {
    if (!this.isReady) {
      throw new Error('LLM이 아직 초기화되지 않았습니다');
    }

    try {
      const messages = [];

      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }

      // 대화 히스토리 제한 (메모리 절약)
      const recentHistory = this.conversationHistory.slice(-4);
      messages.push(...recentHistory);

      messages.push({ role: 'user', content: userMessage });

      const reply = await this.engine.chat.completions.create({
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      });

      const response = reply.choices[0].message.content;

      // 히스토리 업데이트
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response }
      );

      return response;
    } catch (error) {
      console.error('LLM 채팅 오류:', error);
      throw error;
    }
  }

  async generateHint(currentState, level, attemptCount) {
    const systemPrompt = `당신은 초등학생을 위한 친절한 코딩 튜터입니다.
간단하고 이해하기 쉬운 한글로 힌트를 제공하세요.
답을 직접 주지 말고, 학생이 스스로 생각할 수 있게 유도하세요.`;

    const userMessage = `
레벨 ${level.id}: ${level.title}
목표: 캐릭터를 (${level.goal.x}, ${level.goal.y})로 이동
현재 블록: ${JSON.stringify(currentState.blocks.map(b => b.blockType))}
현재 위치: (${currentState.character.x}, ${currentState.character.y})
시도 횟수: ${attemptCount}

힌트를 주세요 (2-3문장):`;

    return await this.chat(userMessage, systemPrompt, 100);
  }

  async analyzeError(currentState, expectedGoal) {
    const systemPrompt = `당신은 학생의 코드 오류를 분석하는 전문가입니다.
JSON 형식으로만 응답하세요.`;

    const userMessage = `
블록: ${JSON.stringify(currentState.blocks)}
목표: (${expectedGoal.x}, ${expectedGoal.y})
결과: (${currentState.character.x}, ${currentState.character.y})

다음 JSON 형식으로 분석하세요:
{
  "issue": "문제 요약",
  "concept": "놓친 개념",
  "hint": "힌트"
}`;

    const response = await this.chat(userMessage, systemPrompt, 150);

    try {
      return JSON.parse(response);
    } catch {
      return {
        issue: "예상과 다른 위치",
        concept: "블록 순서",
        hint: "블록의 순서를 다시 확인해보세요"
      };
    }
  }

  async processAction(action, currentState) {
    const systemPrompt = `당신은 드래그 앤 드롭 동작을 판단하는 시스템입니다.
다음 중 하나만 응답하세요: "replace", "insert", "reject"`;

    const userMessage = `
동작: ${action}
현재 상태: ${JSON.stringify(currentState)}

어떻게 처리할까요?`;

    const response = await this.chat(userMessage, systemPrompt, 20);
    const decision = response.toLowerCase().trim();

    if (decision.includes('replace')) return { action: 'replace' };
    if (decision.includes('insert')) return { action: 'insert' };
    return { action: 'reject' };
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  async resetConversation() {
    if (this.engine && this.engine.resetChat) {
      await this.engine.resetChat();
    }
    this.clearHistory();
  }

  async unload() {
    if (this.engine) {
      await this.engine.unload();
      this.isReady = false;
    }
  }
}

export default LLMEngine;
