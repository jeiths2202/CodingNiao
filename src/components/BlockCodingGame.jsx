import { useState, useEffect, useRef } from 'react';

// Components
import BlockPalette from './BlockPalette';
import Workspace from './Workspace';
import GameGrid from './GameGrid';
import LevelSelector from './LevelSelector';
import ControlPanel from './ControlPanel';

// Engines
import StateManager from '../engine/StateManager';
import ExecutionEngine from '../engine/ExecutionEngine';
import DragDropHandler from '../engine/DragDropHandler';

// Data
import levelsData from '../data/levels.json';
import blocksData from '../data/blocks.json';

// Utils
import { getFallbackHint } from '../utils/fallbackHints';

function BlockCodingGame({ llmEngine, isAIReady, onEarnCoins, onBack }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState([]);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [characterPosition, setCharacterPosition] = useState(null);

  const stateManagerRef = useRef(null);
  const executionEngineRef = useRef(null);
  const dragDropHandlerRef = useRef(null);

  const level = levelsData.find(l => l.id === currentLevel) || levelsData[0];

  useEffect(() => {
    stateManagerRef.current = new StateManager();
    executionEngineRef.current = new ExecutionEngine(
      stateManagerRef.current,
      setCharacterPosition
    );

    const savedState = stateManagerRef.current.getFullState();
    setXp(savedState.xp);
    setBadges(savedState.badges);
    setCompletedLevels(savedState.completedLevels);
  }, []);

  useEffect(() => {
    if (stateManagerRef.current && llmEngine) {
      const handler = new DragDropHandler(llmEngine, stateManagerRef.current);
      handler.setupDragHandlers();
      dragDropHandlerRef.current = handler;

      return () => {
        if (dragDropHandlerRef.current) {
          dragDropHandlerRef.current.cleanup();
        }
      };
    }
  }, [currentLevel, llmEngine]);

  const handleExecute = async () => {
    if (!executionEngineRef.current || isExecuting) return;

    setIsExecuting(true);
    setAttemptCount(prev => prev + 1);

    executionEngineRef.current.resetCharacter(
      level.start.x,
      level.start.y,
      level.start.direction
    );

    setCharacterPosition({
      x: level.start.x,
      y: level.start.y,
      direction: level.start.direction
    });

    await executionEngineRef.current.executeWorkspace();

    const isSuccess = executionEngineRef.current.checkGoal(level.goal.x, level.goal.y);

    if (isSuccess) {
      handleSuccess();
    } else {
      handleFailure();
    }

    setIsExecuting(false);
  };

  const handleSuccess = () => {
    const earnedXP = level.xpReward || 10;
    const earnedCoins = Math.floor(earnedXP / 2); // XP의 절반을 코인으로

    stateManagerRef.current.completeLevel(level.id, earnedXP);
    const newState = stateManagerRef.current.getFullState();

    setXp(newState.xp);
    setBadges(newState.badges);
    setCompletedLevels(newState.completedLevels);
    setAttemptCount(0);

    // 코인 획득
    onEarnCoins(earnedCoins);

    showToast(`🎉 성공! +${earnedCoins} 코인 획득!`, 'success');

    setTimeout(() => {
      if (currentLevel < levelsData.length) {
        setCurrentLevel(currentLevel + 1);
        stateManagerRef.current.clearWorkspace();
        setCharacterPosition(null);
      }
    }, 2000);
  };

  const handleFailure = () => {
    showToast('😅 아직 목표에 도달하지 못했어요. 다시 시도해보세요!', 'warning');
  };

  const handleClear = () => {
    if (stateManagerRef.current) {
      stateManagerRef.current.clearWorkspace();
      setAttemptCount(0);
      setCharacterPosition(null);
    }
  };

  const handleHint = async () => {
    if (!isAIReady) {
      const hint = getFallbackHint(level.id, attemptCount);
      showModal('💡 힌트', hint);
      return;
    }

    try {
      const currentState = stateManagerRef.current.getWorkspaceState();
      showToast('AI가 힌트를 생성 중입니다...', 'info');

      const hintPrompt = `레벨 ${level.id}: ${level.title}
목표: (${level.goal.x}, ${level.goal.y})
현재 블록: ${currentState.blocks.filter(b => b).map(b => b.blockType).join(', ')}
시도: ${attemptCount}번

초등학생이 이해할 수 있는 힌트를 2-3문장으로 주세요:`;

      const hint = await llmEngine.chat(hintPrompt, '친절한 코딩 튜터입니다.', 100);
      showModal('💡 AI 힌트', hint);
    } catch (error) {
      const hint = getFallbackHint(level.id, attemptCount);
      showModal('💡 힌트', hint);
    }
  };

  const handleSelectLevel = (levelId) => {
    setCurrentLevel(levelId);
    setAttemptCount(0);
    setCharacterPosition(null);
    if (stateManagerRef.current) {
      stateManagerRef.current.clearWorkspace();
    }
  };

  const showToast = (message, type = 'info') => {
    const alertTypes = {
      success: 'alert-success',
      info: 'alert-info',
      warning: 'alert-warning',
      error: 'alert-error'
    };

    const toast = document.createElement('div');
    toast.className = 'toast toast-top toast-end z-50';
    toast.innerHTML = `
      <div class="alert ${alertTypes[type]} shadow-lg">
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const showModal = (title, content) => {
    const modal = document.createElement('dialog');
    modal.className = 'modal modal-open';
    modal.innerHTML = `
      <div class="modal-box">
        <h3 class="font-bold text-lg">${title}</h3>
        <p class="py-4">${content}</p>
        <div class="modal-action">
          <button class="btn" onclick="this.closest('dialog').remove()">닫기</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button onclick="this.closest('dialog').remove()">close</button>
      </form>
    `;
    document.body.appendChild(modal);
  };

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button className="btn btn-ghost" onClick={onBack}>
            ← 메인 메뉴
          </button>
          <h1 className="text-3xl font-bold">🧩 블록 코딩 모험</h1>
          <div></div>
        </div>

        <div className="card bg-primary text-primary-content mb-4">
          <div className="card-body">
            <h2 className="card-title">
              레벨 {level.id}: {level.title}
            </h2>
            <p>{level.description}</p>
            <p className="text-sm">{'⭐'.repeat(level.difficulty)} | 보상: {level.xpReward} XP</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <BlockPalette
              availableBlocks={level.availableBlocks}
              blocksData={blocksData}
            />
            <Workspace maxBlocks={level.maxBlocks} />
          </div>

          <div className="space-y-4">
            <GameGrid
              gridSize={level.gridSize}
              start={level.start}
              goal={level.goal}
              obstacles={level.obstacles}
              characterPosition={characterPosition}
            />
            <ControlPanel
              onExecute={handleExecute}
              onClear={handleClear}
              onHint={handleHint}
              isExecuting={isExecuting}
              isAIReady={isAIReady}
              xp={xp}
              badges={badges}
            />
          </div>
        </div>

        <div className="mt-4">
          <LevelSelector
            levels={levelsData}
            currentLevel={currentLevel}
            completedLevels={completedLevels}
            onSelectLevel={handleSelectLevel}
          />
        </div>
      </div>
    </div>
  );
}

export default BlockCodingGame;
