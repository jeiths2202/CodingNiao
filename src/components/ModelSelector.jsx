import React, { useState } from 'react';

const ModelSelector = ({ onSelectModel, loadingProgress }) => {
  const [selectedModel, setSelectedModel] = useState('Llama-3.2-1B-Instruct-q4f16_1-MLC');

  const models = [
    {
      id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
      name: 'Llama 3.2 1B (추천)',
      size: '~0.8GB',
      speed: '매우 빠름',
      quality: '우수',
      recommended: true,
      description: '가벼운 Meta 모델 - 빠른 로딩과 우수한 품질'
    },
    {
      id: 'gemma-2-2b-it-q4f16_1-MLC',
      name: 'Gemma 2 2B',
      size: '~1.2GB',
      speed: '빠름',
      quality: '우수',
      recommended: false,
      description: 'Google의 균형잡힌 모델'
    },
    {
      id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
      name: 'Phi-3.5 Mini',
      size: '~2.3GB',
      speed: '빠름',
      quality: '우수',
      recommended: false,
      description: 'Microsoft의 경량 모델'
    },
    {
      id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
      name: 'Llama 3.2 3B',
      size: '~1.9GB',
      speed: '보통',
      quality: '우수',
      recommended: false,
      description: 'Meta의 균형잡힌 모델'
    },
    {
      id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
      name: 'Qwen 2.5 1.5B',
      size: '~0.9GB',
      speed: '빠름',
      quality: '보통',
      recommended: false,
      description: 'Alibaba의 다국어 모델'
    }
  ];

  const handleDownload = () => {
    onSelectModel(selectedModel);
  };

  if (loadingProgress && loadingProgress.status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="card bg-base-100 shadow-xl max-w-md w-full mx-4">
          <div className="card-body">
            <h2 className="card-title">🤖 AI 모델 다운로드 중</h2>
            <p className="text-sm text-gray-600">{loadingProgress.message}</p>
            <progress
              className="progress progress-primary w-full"
              value={loadingProgress.progress}
              max="100"
            ></progress>
            <div className="text-center text-sm mt-2">
              {Math.round(loadingProgress.progress)}%
            </div>
            <div className="alert alert-info mt-4">
              <span className="text-xs">
                💡 첫 다운로드는 시간이 걸릴 수 있습니다. 다음부터는 캐시된 모델을 사용합니다.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card bg-base-100 shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="card-body">
          <h2 className="card-title text-2xl">🤖 AI 모델 선택</h2>
          <p className="text-gray-600 mb-4">
            학습 도우미로 사용할 AI 모델을 선택하세요. 추천 모델은 가볍고 빠릅니다.
          </p>

          <div className="space-y-3">
            {models.map(model => (
              <div
                key={model.id}
                className={`
                  card border-2 cursor-pointer transition-all
                  ${selectedModel === model.id
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-gray-300 hover:border-primary'
                  }
                  ${model.recommended ? 'ring-2 ring-success ring-offset-2' : ''}
                `}
                onClick={() => setSelectedModel(model.id)}
              >
                <div className="card-body p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold flex items-center gap-2">
                        {model.name}
                        {model.recommended && (
                          <span className="badge badge-success badge-sm">추천</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                      <div className="flex gap-3 mt-2">
                        <span className="badge badge-outline badge-sm">
                          📦 {model.size}
                        </span>
                        <span className="badge badge-outline badge-sm">
                          ⚡ {model.speed}
                        </span>
                        <span className="badge badge-outline badge-sm">
                          ⭐ {model.quality}
                        </span>
                      </div>
                    </div>
                    <div className="form-control">
                      <input
                        type="radio"
                        name="model"
                        className="radio radio-primary"
                        checked={selectedModel === model.id}
                        onChange={() => setSelectedModel(model.id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="alert alert-warning mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm">
              모델은 브라우저에 다운로드됩니다. 데이터 사용량을 확인하세요.
            </span>
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-primary"
              onClick={handleDownload}
            >
              선택한 모델 다운로드
            </button>
          </div>

          <div className="divider">또는</div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onSelectModel(null)}
          >
            AI 없이 계속하기 (기본 힌트만 사용)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;
