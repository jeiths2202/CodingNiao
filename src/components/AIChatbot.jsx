import React, { useState, useEffect, useRef } from 'react';
import LLMEngine from '../engine/LLMEngine';
import ModelSelector from './ModelSelector';

const AIChatbot = ({ onBack, onEarnCoins }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAIReady, setIsAIReady] = useState(false);
  const [aiProgress, setAiProgress] = useState({ status: 'idle', message: '', progress: 0 });
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const llmEngineRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // LLM 엔진 초기화
    llmEngineRef.current = new LLMEngine((progress) => {
      setAiProgress(progress);
      if (progress.status === 'ready') {
        setIsAIReady(true);
        addSystemMessage('AI가 준비되었습니다! 무엇이든 물어보세요 😊');
      }
    });

    // 캐시된 모델 확인
    checkCachedModels();

    return () => {
      if (llmEngineRef.current) {
        llmEngineRef.current.unload();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkCachedModels = async () => {
    if (!llmEngineRef.current) return;

    const recommendedModel = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
    const hasCache = await llmEngineRef.current.checkModelInCache(recommendedModel);

    if (hasCache) {
      // 캐시된 모델이 있으면 자동 로드하지 않고 대기
      addSystemMessage('AI 모델을 불러오려면 "AI 시작하기" 버튼을 눌러주세요.');
    } else {
      addSystemMessage('AI를 사용하려면 먼저 모델을 선택해주세요. "AI 모델 선택" 버튼을 눌러주세요.');
    }
  };

  const handleModelSelect = async (modelId) => {
    if (modelId === null) {
      setShowModelSelector(false);
      return;
    }

    setSelectedModel(modelId);
    setShowModelSelector(false);

    if (llmEngineRef.current) {
      addSystemMessage(`${modelId} 모델을 로딩하고 있습니다...`);
      await llmEngineRef.current.initialize(modelId);
    }
  };

  const handleStartAI = async () => {
    if (isAIReady) return;

    const recommendedModel = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
    if (llmEngineRef.current) {
      addSystemMessage(`AI를 시작합니다...`);
      await llmEngineRef.current.initialize(selectedModel || recommendedModel);
    }
  };

  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      text,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isAIReady || isSending) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');

    // 사용자 메시지 추가
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: userMsg,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }]);

    setIsSending(true);

    try {
      // AI 응답 생성
      const systemPrompt = '당신은 초등학생들을 위한 친절하고 재미있는 AI 친구입니다. 코딩, 컴퓨터, 과학에 대해 쉽게 설명해주고, 격려와 칭찬을 많이 해주세요.';
      const response = await llmEngineRef.current.chat(userMsg, systemPrompt, 200);

      // AI 응답 추가
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: response,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }]);

      // 대화 1회당 5코인 보상
      onEarnCoins(5);

    } catch (error) {
      console.error('AI 응답 오류:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'system',
        text: '❌ AI 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.',
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (llmEngineRef.current) {
      llmEngineRef.current.resetConversation();
    }
    setMessages([]);
    addSystemMessage('대화 기록이 초기화되었습니다.');
  };

  const handleDeleteModel = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);

    try {
      if (llmEngineRef.current) {
        await llmEngineRef.current.deleteModel();
        setIsAIReady(false);
        setSelectedModel(null);
        setMessages([]);
        addSystemMessage('✅ AI 모델이 삭제되었습니다. 브라우저 캐시에서 모델 데이터가 제거되었습니다.');
        setAiProgress({ status: 'idle', message: '', progress: 0 });
      }
    } catch (error) {
      console.error('모델 삭제 오류:', error);
      addSystemMessage('❌ 모델 삭제 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const suggestedQuestions = [
    "코딩이 뭐야?",
    "컴퓨터는 어떻게 동작해?",
    "AI는 어떻게 만들어?",
    "프로그래머가 되려면?",
    "재미있는 코딩 게임 추천해줘",
    "파이썬이 뭐야?",
    "알고리즘이 뭐야?",
    "희짱이 누구야?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-teal-100 p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <button className="btn btn-ghost" onClick={onBack}>
            ← 돌아가기
          </button>
          <h1 className="text-3xl font-bold">🤖 AI 챗봇</h1>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-outline"
              onClick={handleClearChat}
              disabled={messages.length === 0}
            >
              🗑️ 대화 초기화
            </button>
            {(isAIReady || selectedModel) && (
              <button
                className="btn btn-sm btn-error"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '🗑️ 모델 삭제'}
              </button>
            )}
          </div>
        </div>

        {/* AI 상태 및 컨트롤 */}
        <div className="card bg-base-100 shadow-xl mb-4">
          <div className="card-body p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`badge ${isAIReady ? 'badge-success' : 'badge-warning'} gap-2`}>
                  {isAIReady ? '🟢 AI 준비됨' : '🟡 AI 대기중'}
                </div>
                {selectedModel && (
                  <span className="text-sm text-gray-600">
                    모델: {selectedModel.split('-')[0]}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!isAIReady && (
                  <>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setShowModelSelector(true)}
                    >
                      AI 모델 선택
                    </button>
                    {selectedModel && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={handleStartAI}
                      >
                        AI 시작하기
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 로딩 프로그레스 */}
            {aiProgress.status === 'loading' && (
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{aiProgress.message}</span>
                  <span className="font-bold text-primary">{Math.round(aiProgress.progress * 100)}%</span>
                </div>
                <progress
                  className="progress progress-primary w-full h-3"
                  value={aiProgress.progress * 100}
                  max="100"
                ></progress>
                {aiProgress.detail && (
                  <div className="mt-2 p-2 bg-base-200 rounded text-xs">
                    <div className="flex items-start gap-2">
                      <span className="loading loading-spinner loading-xs"></span>
                      <span className="text-gray-600">{aiProgress.detail}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 에러 표시 */}
            {aiProgress.status === 'error' && (
              <div className="alert alert-error mt-3">
                <span>❌ {aiProgress.message}</span>
                {aiProgress.detail && (
                  <div className="text-xs mt-1">{aiProgress.detail}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="card bg-base-100 shadow-xl flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-2">AI 챗봇과 대화해보세요!</h3>
                <p className="mb-4">코딩, 컴퓨터, AI에 대해 무엇이든 물어보세요.</p>

                {/* 추천 질문 */}
                {!isAIReady ? (
                  <div className="alert alert-info">
                    <span>먼저 AI 모델을 선택하고 시작해주세요!</span>
                  </div>
                ) : (
                  <div className="mt-6">
                    <p className="font-bold mb-3">추천 질문:</p>
                    <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setInputMessage(q);
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`chat ${
                    msg.type === 'user' ? 'chat-end' :
                    msg.type === 'ai' ? 'chat-start' :
                    'chat-center'
                  }`}
                >
                  {msg.type !== 'system' && (
                    <div className="chat-header">
                      {msg.type === 'user' ? '나' : '🤖 AI'}
                      <time className="text-xs opacity-50 ml-1">{msg.time}</time>
                    </div>
                  )}
                  <div className={`chat-bubble ${
                    msg.type === 'user' ? 'chat-bubble-primary' :
                    msg.type === 'ai' ? 'chat-bubble-success' :
                    'chat-bubble-info'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {isSending && (
              <div className="chat chat-start">
                <div className="chat-bubble chat-bubble-success">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isAIReady ? "메시지를 입력하세요..." : "AI를 먼저 시작해주세요"}
                className="input input-bordered flex-1"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isAIReady || isSending}
              />
              <button
                className="btn btn-primary"
                onClick={handleSendMessage}
                disabled={!isAIReady || !inputMessage.trim() || isSending}
              >
                {isSending ? <span className="loading loading-spinner loading-sm"></span> : '전송'}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              💡 대화할 때마다 5코인을 획득해요!
            </div>
          </div>
        </div>

        {/* 안내 */}
        <div className="alert alert-info mt-4">
          <span>
            🤖 AI와 대화하며 코딩과 컴퓨터에 대해 배워보세요! 궁금한 것을 자유롭게 질문하세요.
          </span>
        </div>
      </div>

      {/* 모델 선택 모달 */}
      {showModelSelector && (
        <ModelSelector
          onSelectModel={handleModelSelect}
          loadingProgress={aiProgress.status === 'loading' ? aiProgress : null}
        />
      )}

      {/* 모델 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card bg-base-100 shadow-xl max-w-md">
            <div className="card-body">
              <h3 className="card-title text-xl">⚠️ 모델 삭제 확인</h3>
              <p className="py-4">
                다운로드한 AI 모델을 브라우저 캐시에서 삭제하시겠습니까?
              </p>
              <div className="bg-warning bg-opacity-20 p-3 rounded-lg mb-2">
                <p className="text-sm">
                  ⚠️ <strong>주의:</strong> 모델을 삭제하면 다시 사용하려면 재다운로드가 필요합니다.
                  {selectedModel && (
                    <span className="block mt-1">
                      모델 크기: 약 0.8GB
                    </span>
                  )}
                </p>
              </div>
              <div className="card-actions justify-end gap-2">
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  취소
                </button>
                <button
                  className="btn btn-error"
                  onClick={handleDeleteModel}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
