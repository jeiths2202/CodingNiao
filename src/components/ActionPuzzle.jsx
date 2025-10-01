import React, { useState, useEffect } from 'react';

const ActionPuzzle = ({ onBack, onEarnCoins }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 5 });
  const [enemies, setEnemies] = useState([]);
  const [coins, setCoins] = useState([]);
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [commands, setCommands] = useState([]);
  const [message, setMessage] = useState('');
  const [enemyInterval, setEnemyInterval] = useState(null);

  const levels = [
    {
      id: 1,
      name: '코인 수집',
      grid: { width: 8, height: 6 },
      start: { x: 1, y: 5 },
      initialEnemies: [
        { x: 4, y: 2, direction: 'horizontal', speed: 1 }
      ],
      coinPositions: [
        { x: 3, y: 0 }, { x: 5, y: 0 }, { x: 7, y: 3 }
      ],
      goal: { x: 7, y: 5 },
      targetCoins: 3,
      reward: 60
    },
    {
      id: 2,
      name: '적 피하기',
      grid: { width: 10, height: 7 },
      start: { x: 0, y: 3 },
      initialEnemies: [
        { x: 3, y: 1, direction: 'vertical', speed: 1 },
        { x: 6, y: 5, direction: 'horizontal', speed: 1 }
      ],
      coinPositions: [
        { x: 2, y: 0 }, { x: 5, y: 3 }, { x: 8, y: 1 }, { x: 9, y: 6 }
      ],
      goal: { x: 9, y: 3 },
      targetCoins: 4,
      reward: 80
    },
    {
      id: 3,
      name: '미로 탈출',
      grid: { width: 12, height: 8 },
      start: { x: 0, y: 0 },
      initialEnemies: [
        { x: 4, y: 2, direction: 'horizontal', speed: 1 },
        { x: 7, y: 4, direction: 'vertical', speed: 1 },
        { x: 10, y: 6, direction: 'horizontal', speed: 1 }
      ],
      coinPositions: [
        { x: 2, y: 2 }, { x: 5, y: 0 }, { x: 8, y: 3 },
        { x: 3, y: 5 }, { x: 11, y: 2 }
      ],
      goal: { x: 11, y: 7 },
      targetCoins: 5,
      reward: 100
    }
  ];

  const level = levels[currentLevel - 1];

  useEffect(() => {
    resetLevel();
    return () => {
      if (enemyInterval) clearInterval(enemyInterval);
    };
  }, [currentLevel]);

  const resetLevel = () => {
    setPlayerPos(level.start);
    setEnemies(level.initialEnemies.map(e => ({ ...e, initialX: e.x, initialY: e.y })));
    setCoins(level.coinPositions.map(c => ({ ...c, collected: false })));
    setCollectedCoins(0);
    setCommands([]);
    setMessage('');
    if (enemyInterval) clearInterval(enemyInterval);
  };

  const addCommand = (cmd) => {
    if (isExecuting) return;
    setCommands([...commands, cmd]);
  };

  const clearCommands = () => {
    if (isExecuting) return;
    setCommands([]);
  };

  const moveEnemies = () => {
    setEnemies(prevEnemies => prevEnemies.map(enemy => {
      let newX = enemy.x;
      let newY = enemy.y;

      if (enemy.direction === 'horizontal') {
        newX = enemy.x + enemy.speed;
        if (newX >= level.grid.width || newX < 0) {
          enemy.speed *= -1;
          newX = enemy.x + enemy.speed;
        }
      } else if (enemy.direction === 'vertical') {
        newY = enemy.y + enemy.speed;
        if (newY >= level.grid.height || newY < 0) {
          enemy.speed *= -1;
          newY = enemy.y + enemy.speed;
        }
      }

      return { ...enemy, x: newX, y: newY };
    }));
  };

  const executeCommands = async () => {
    if (commands.length === 0) {
      setMessage('❌ 명령어를 추가해주세요!');
      return;
    }

    setIsExecuting(true);
    setMessage('');
    let pos = { ...level.start };
    let collected = 0;
    let currentCoins = [...coins];

    // 적 이동 시작
    const interval = setInterval(moveEnemies, 500);
    setEnemyInterval(interval);

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      let newPos = { ...pos };

      switch (cmd) {
        case 'up':
          newPos.y = Math.max(0, pos.y - 1);
          break;
        case 'down':
          newPos.y = Math.min(level.grid.height - 1, pos.y + 1);
          break;
        case 'left':
          newPos.x = Math.max(0, pos.x - 1);
          break;
        case 'right':
          newPos.x = Math.min(level.grid.width - 1, pos.x + 1);
          break;
        case 'wait':
          // 대기 명령
          break;
      }

      pos = newPos;
      setPlayerPos(pos);

      // 코인 수집 체크
      const coinIndex = currentCoins.findIndex(c => c.x === pos.x && c.y === pos.y && !c.collected);
      if (coinIndex !== -1) {
        currentCoins[coinIndex].collected = true;
        collected++;
        setCollectedCoins(collected);
        setCoins([...currentCoins]);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // 적과 충돌 체크
      const hitEnemy = enemies.some(e => e.x === pos.x && e.y === pos.y);
      if (hitEnemy) {
        setMessage('❌ 적에게 잡혔습니다!');
        clearInterval(interval);
        setIsExecuting(false);
        setTimeout(resetLevel, 1500);
        return;
      }
    }

    clearInterval(interval);

    // 목표 도달 및 코인 수집 체크
    if (pos.x === level.goal.x && pos.y === level.goal.y && collected >= level.targetCoins) {
      setMessage(`🎉 클리어! +${level.reward} 코인`);
      onEarnCoins(level.reward);

      setTimeout(() => {
        if (currentLevel < levels.length) {
          setCurrentLevel(currentLevel + 1);
        } else {
          setMessage('🎊 모든 레벨을 클리어했습니다!');
        }
      }, 2000);
    } else if (collected < level.targetCoins) {
      setMessage(`❌ 코인을 ${level.targetCoins}개 모아야 합니다! (현재: ${collected}개)`);
    } else {
      setMessage('❌ 목표 지점에 도달하지 못했습니다!');
    }

    setIsExecuting(false);
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < level.grid.height; y++) {
      for (let x = 0; x < level.grid.width; x++) {
        const isPlayer = playerPos.x === x && playerPos.y === y;
        const isGoal = level.goal.x === x && level.goal.y === y;
        const isEnemy = enemies.some(e => e.x === x && e.y === y);
        const coin = coins.find(c => c.x === x && c.y === y && !c.collected);

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`
              aspect-square flex items-center justify-center text-2xl border border-gray-300
              ${isGoal ? 'bg-green-200' : 'bg-gray-100'}
            `}
          >
            {isPlayer && '😺'}
            {isEnemy && '👾'}
            {coin && '💰'}
            {isGoal && !isPlayer && '🏁'}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 to-orange-100 p-4">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <button className="btn btn-ghost" onClick={onBack}>
            ← 돌아가기
          </button>
          <h1 className="text-3xl font-bold">⚔️ 액션 퍼즐</h1>
          <div className="text-xl">레벨 {currentLevel}/3</div>
        </div>

        {/* 레벨 정보 */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">{level.name}</h2>
          <p className="text-gray-600">
            코인 {collectedCoins}/{level.targetCoins} | 적을 피해 코인을 모으고 목표에 도달하세요!
          </p>
        </div>

        {/* 게임 그리드 */}
        <div className="bg-base-100 p-4 rounded-lg mb-4">
          <div
            className="grid gap-1 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${level.grid.width}, minmax(0, 1fr))`,
              maxWidth: '600px'
            }}
          >
            {renderGrid()}
          </div>
        </div>

        {/* 명령어 패널 */}
        <div className="card bg-base-100 shadow-xl mb-4">
          <div className="card-body">
            <h3 className="card-title">이동 명령</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <button
                className="btn btn-primary"
                onClick={() => addCommand('up')}
                disabled={isExecuting}
              >
                ⬆️ 위
              </button>
              <button
                className="btn btn-primary"
                onClick={() => addCommand('down')}
                disabled={isExecuting}
              >
                ⬇️ 아래
              </button>
              <button
                className="btn btn-primary"
                onClick={() => addCommand('left')}
                disabled={isExecuting}
              >
                ⬅️ 왼쪽
              </button>
              <button
                className="btn btn-primary"
                onClick={() => addCommand('right')}
                disabled={isExecuting}
              >
                ➡️ 오른쪽
              </button>
            </div>
            <button
              className="btn btn-secondary mb-4"
              onClick={() => addCommand('wait')}
              disabled={isExecuting}
            >
              ⏸️ 대기 (적이 지나갈 때까지 기다림)
            </button>

            {/* 명령어 리스트 */}
            <div className="bg-gray-100 p-4 rounded-lg min-h-[60px]">
              <div className="font-bold mb-2">명령어 순서:</div>
              <div className="flex flex-wrap gap-2">
                {commands.length === 0 ? (
                  <span className="text-gray-500">명령어를 추가해주세요</span>
                ) : (
                  commands.map((cmd, idx) => (
                    <span key={idx} className="badge badge-primary badge-lg">
                      {cmd === 'up' ? '⬆️' : cmd === 'down' ? '⬇️' :
                       cmd === 'left' ? '⬅️' : cmd === 'right' ? '➡️' : '⏸️'}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 실행 버튼 */}
            <div className="flex gap-2 mt-4">
              <button
                className="btn btn-success flex-1"
                onClick={executeCommands}
                disabled={isExecuting}
              >
                {isExecuting ? '실행 중...' : '▶️ 실행'}
              </button>
              <button
                className="btn btn-warning"
                onClick={clearCommands}
                disabled={isExecuting}
              >
                🗑️ 초기화
              </button>
              <button
                className="btn btn-error"
                onClick={resetLevel}
                disabled={isExecuting}
              >
                🔄 레벨 리셋
              </button>
            </div>
          </div>
        </div>

        {/* 메시지 */}
        {message && (
          <div className={`alert ${message.includes('🎉') || message.includes('🎊') ? 'alert-success' : 'alert-error'}`}>
            <span className="text-lg">{message}</span>
          </div>
        )}

        {/* 설명 */}
        <div className="alert alert-info">
          <span>
            💡 움직이는 적(👾)을 피해 모든 코인(💰)을 수집하고 목표(🏁)에 도달하세요! ⏸️ 대기 명령으로 타이밍을 조절할 수 있습니다.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActionPuzzle;
