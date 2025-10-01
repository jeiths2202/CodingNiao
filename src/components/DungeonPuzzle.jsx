import React, { useState, useEffect } from 'react';

const DungeonPuzzle = ({ onBack, onEarnCoins }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [moves, setMoves] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [message, setMessage] = useState('');
  const [collectedKeys, setCollectedKeys] = useState([]);

  const levels = [
    {
      id: 1,
      name: '첫 번째 방',
      grid: 5,
      start: { x: 0, y: 0 },
      goal: { x: 4, y: 4 },
      obstacles: [{ x: 2, y: 2 }],
      keys: [{ x: 2, y: 0, color: 'yellow' }],
      doors: [{ x: 4, y: 2, color: 'yellow' }],
      reward: 50
    },
    {
      id: 2,
      name: '두 번째 방',
      grid: 6,
      start: { x: 0, y: 0 },
      goal: { x: 5, y: 5 },
      obstacles: [{ x: 2, y: 2 }, { x: 3, y: 3 }, { x: 1, y: 3 }],
      keys: [{ x: 1, y: 1, color: 'blue' }, { x: 4, y: 1, color: 'red' }],
      doors: [{ x: 3, y: 1, color: 'blue' }, { x: 5, y: 3, color: 'red' }],
      reward: 75
    },
    {
      id: 3,
      name: '세 번째 방',
      grid: 7,
      start: { x: 0, y: 0 },
      goal: { x: 6, y: 6 },
      obstacles: [{ x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 1, y: 4 }, { x: 4, y: 1 }],
      keys: [
        { x: 1, y: 1, color: 'yellow' },
        { x: 5, y: 1, color: 'blue' },
        { x: 1, y: 5, color: 'red' }
      ],
      doors: [
        { x: 3, y: 1, color: 'yellow' },
        { x: 5, y: 3, color: 'blue' },
        { x: 3, y: 5, color: 'red' }
      ],
      reward: 100
    }
  ];

  const level = levels[currentLevel - 1];

  useEffect(() => {
    setPlayerPos(level.start);
    setMoves([]);
    setCollectedKeys([]);
    setMessage('');
  }, [currentLevel]);

  const addMove = (direction) => {
    if (isExecuting) return;
    setMoves([...moves, direction]);
  };

  const clearMoves = () => {
    if (isExecuting) return;
    setMoves([]);
  };

  const executeCode = async () => {
    if (moves.length === 0) {
      setMessage('❌ 이동 명령을 추가해주세요!');
      return;
    }

    setIsExecuting(true);
    setMessage('');
    let pos = { ...level.start };
    let keys = [];

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      let newPos = { ...pos };

      switch (move) {
        case 'up':
          newPos.y = Math.max(0, pos.y - 1);
          break;
        case 'down':
          newPos.y = Math.min(level.grid - 1, pos.y + 1);
          break;
        case 'left':
          newPos.x = Math.max(0, pos.x - 1);
          break;
        case 'right':
          newPos.x = Math.min(level.grid - 1, pos.x + 1);
          break;
      }

      // 장애물 체크
      const hitObstacle = level.obstacles.some(
        obs => obs.x === newPos.x && obs.y === newPos.y
      );

      // 문 체크
      const door = level.doors.find(d => d.x === newPos.x && d.y === newPos.y);
      if (door && !keys.includes(door.color)) {
        setMessage(`❌ ${door.color} 열쇠가 필요합니다!`);
        setIsExecuting(false);
        setPlayerPos(level.start);
        setCollectedKeys([]);
        return;
      }

      if (hitObstacle) {
        setMessage('❌ 장애물에 부딪혔습니다!');
        setIsExecuting(false);
        setPlayerPos(level.start);
        setCollectedKeys([]);
        return;
      }

      pos = newPos;
      setPlayerPos(pos);

      // 열쇠 수집
      const key = level.keys.find(k => k.x === pos.x && k.y === pos.y);
      if (key && !keys.includes(key.color)) {
        keys.push(key.color);
        setCollectedKeys([...keys]);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 목표 도달 체크
    if (pos.x === level.goal.x && pos.y === level.goal.y) {
      setMessage(`🎉 클리어! +${level.reward} 코인`);
      onEarnCoins(level.reward);

      setTimeout(() => {
        if (currentLevel < levels.length) {
          setCurrentLevel(currentLevel + 1);
        } else {
          setMessage('🎊 모든 레벨을 클리어했습니다!');
        }
      }, 2000);
    } else {
      setMessage('❌ 목표에 도달하지 못했습니다!');
    }

    setIsExecuting(false);
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < level.grid; y++) {
      for (let x = 0; x < level.grid; x++) {
        const isPlayer = playerPos.x === x && playerPos.y === y;
        const isStart = level.start.x === x && level.start.y === y;
        const isGoal = level.goal.x === x && level.goal.y === y;
        const isObstacle = level.obstacles.some(obs => obs.x === x && obs.y === y);
        const key = level.keys.find(k => k.x === x && k.y === y);
        const door = level.doors.find(d => d.x === x && d.y === y);
        const keyCollected = key && collectedKeys.includes(key.color);

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`
              aspect-square flex items-center justify-center text-2xl border border-gray-300
              ${isObstacle ? 'bg-gray-700' : 'bg-white'}
              ${isStart && !isPlayer ? 'bg-green-100' : ''}
              ${isGoal ? 'bg-yellow-100' : ''}
            `}
          >
            {isPlayer && '😺'}
            {!isPlayer && isStart && '🏠'}
            {isGoal && '🚪'}
            {isObstacle && '🧱'}
            {key && !keyCollected && (
              <span className={`text-${key.color === 'yellow' ? 'yellow' : key.color === 'blue' ? 'blue' : 'red'}-500`}>
                🔑
              </span>
            )}
            {door && (
              <span className={`text-${door.color === 'yellow' ? 'yellow' : door.color === 'blue' ? 'blue' : 'red'}-500`}>
                🚧
              </span>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <button className="btn btn-ghost text-white" onClick={onBack}>
            ← 돌아가기
          </button>
          <h1 className="text-3xl font-bold">🏰 던전 퍼즐</h1>
          <div className="text-xl">레벨 {currentLevel}/3</div>
        </div>

        {/* 레벨 이름 */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">{level.name}</h2>
          <p className="text-gray-300">희짱을 목표지점까지 이동시키세요!</p>
        </div>

        {/* 수집한 열쇠 */}
        {collectedKeys.length > 0 && (
          <div className="flex justify-center gap-2 mb-4">
            <span>수집한 열쇠:</span>
            {collectedKeys.map((color, idx) => (
              <span key={idx} className="text-2xl">🔑</span>
            ))}
          </div>
        )}

        {/* 게임 그리드 */}
        <div className="bg-base-100 p-4 rounded-lg mb-4">
          <div
            className="grid gap-1 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${level.grid}, minmax(0, 1fr))`,
              maxWidth: '400px'
            }}
          >
            {renderGrid()}
          </div>
        </div>

        {/* 명령어 패널 */}
        <div className="card bg-base-100 shadow-xl mb-4">
          <div className="card-body">
            <h3 className="card-title text-black">이동 명령</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div></div>
              <button
                className="btn btn-primary"
                onClick={() => addMove('up')}
                disabled={isExecuting}
              >
                ⬆️ 위
              </button>
              <div></div>
              <button
                className="btn btn-primary"
                onClick={() => addMove('left')}
                disabled={isExecuting}
              >
                ⬅️ 왼쪽
              </button>
              <button
                className="btn btn-primary"
                onClick={() => addMove('down')}
                disabled={isExecuting}
              >
                ⬇️ 아래
              </button>
              <button
                className="btn btn-primary"
                onClick={() => addMove('right')}
                disabled={isExecuting}
              >
                ➡️ 오른쪽
              </button>
            </div>

            {/* 명령어 리스트 */}
            <div className="bg-gray-100 p-4 rounded-lg min-h-[60px] text-black">
              <div className="font-bold mb-2">명령어 순서:</div>
              <div className="flex flex-wrap gap-2">
                {moves.length === 0 ? (
                  <span className="text-gray-500">명령어를 추가해주세요</span>
                ) : (
                  moves.map((move, idx) => (
                    <span key={idx} className="badge badge-primary">
                      {move === 'up' ? '⬆️' : move === 'down' ? '⬇️' : move === 'left' ? '⬅️' : '➡️'}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 실행 버튼 */}
            <div className="flex gap-2 mt-4">
              <button
                className="btn btn-success flex-1"
                onClick={executeCode}
                disabled={isExecuting}
              >
                {isExecuting ? '실행 중...' : '▶️ 실행'}
              </button>
              <button
                className="btn btn-warning"
                onClick={clearMoves}
                disabled={isExecuting}
              >
                🗑️ 초기화
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
            💡 이동 명령을 조합하여 희짱을 목표까지 이동시키세요! 🔑 열쇠를 먼저 수집해야 🚧 문을 통과할 수 있습니다.
          </span>
        </div>
      </div>
    </div>
  );
};

export default DungeonPuzzle;
