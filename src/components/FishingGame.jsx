import React, { useState, useEffect } from 'react';

const FishingGame = ({ onBack, onEarnCoins }) => {
  const [rod, setRod] = useState({ x: 5, depth: 0 });
  const [fish, setFish] = useState([]);
  const [trash, setTrash] = useState([]);
  const [treasure, setTreasure] = useState([]);
  const [commands, setCommands] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [caught, setCaught] = useState({ fish: 0, trash: 0, treasure: 0 });
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);

  const GRID_WIDTH = 10;
  const GRID_HEIGHT = 8;

  useEffect(() => {
    generateOcean();
  }, []);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  const generateOcean = () => {
    // 물고기 생성 (얕은 곳에 많음)
    const newFish = [];
    for (let i = 0; i < 8; i++) {
      newFish.push({
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: 2 + Math.floor(Math.random() * 3), // 깊이 2-4
        type: Math.random() > 0.5 ? 'small' : 'medium'
      });
    }

    // 쓰레기 생성
    const newTrash = [];
    for (let i = 0; i < 4; i++) {
      newTrash.push({
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: 1 + Math.floor(Math.random() * 5) // 깊이 1-5
      });
    }

    // 보물 생성 (깊은 곳)
    const newTreasure = [];
    for (let i = 0; i < 2; i++) {
      newTreasure.push({
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: 5 + Math.floor(Math.random() * 3) // 깊이 5-7
      });
    }

    setFish(newFish);
    setTrash(newTrash);
    setTreasure(newTreasure);
  };

  const startGame = () => {
    setGameActive(true);
    setTimeLeft(60);
    setCaught({ fish: 0, trash: 0, treasure: 0 });
    setScore(0);
    setCommands([]);
    setRod({ x: 5, depth: 0 });
    setMessage('');
    generateOcean();
  };

  const endGame = () => {
    setGameActive(false);
    const finalScore = score;
    setMessage(`🎣 게임 종료! 총 점수: ${finalScore}점`);
    onEarnCoins(finalScore);
  };

  const addCommand = (cmd) => {
    if (isExecuting || !gameActive) return;
    setCommands([...commands, cmd]);
  };

  const clearCommands = () => {
    if (isExecuting) return;
    setCommands([]);
  };

  const executeCommands = async () => {
    if (commands.length === 0 || !gameActive) return;

    setIsExecuting(true);
    let currentRod = { ...rod };

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];

      switch (cmd) {
        case 'left':
          currentRod.x = Math.max(0, currentRod.x - 1);
          break;
        case 'right':
          currentRod.x = Math.min(GRID_WIDTH - 1, currentRod.x + 1);
          break;
        case 'down':
          currentRod.depth = Math.min(GRID_HEIGHT - 1, currentRod.depth + 1);
          break;
        case 'up':
          currentRod.depth = Math.max(0, currentRod.depth - 1);
          break;
        case 'catch':
          // 잡기 시도
          const caughtFish = fish.find(f => f.x === currentRod.x && f.y === currentRod.depth);
          const caughtTrash = trash.find(t => t.x === currentRod.x && t.y === currentRod.depth);
          const caughtTreasure = treasure.find(t => t.x === currentRod.x && t.y === currentRod.depth);

          if (caughtFish) {
            setFish(fish.filter(f => f !== caughtFish));
            setCaught(prev => ({ ...prev, fish: prev.fish + 1 }));
            const points = caughtFish.type === 'small' ? 10 : 20;
            setScore(prev => prev + points);
          } else if (caughtTreasure) {
            setTreasure(treasure.filter(t => t !== caughtTreasure));
            setCaught(prev => ({ ...prev, treasure: prev.treasure + 1 }));
            setScore(prev => prev + 50);
          } else if (caughtTrash) {
            setTrash(trash.filter(t => t !== caughtTrash));
            setCaught(prev => ({ ...prev, trash: prev.trash + 1 }));
            setScore(prev => prev - 5);
          }
          break;
      }

      setRod({ ...currentRod });
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setCommands([]);
    setIsExecuting(false);
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const isRod = rod.x === x && y <= rod.depth;
        const isRodEnd = rod.x === x && y === rod.depth;
        const fishHere = fish.find(f => f.x === x && f.y === y);
        const trashHere = trash.find(t => t.x === x && t.y === y);
        const treasureHere = treasure.find(t => t.x === x && t.y === y);

        let bgColor = 'bg-blue-100';
        if (y > 3) bgColor = 'bg-blue-300';
        if (y > 5) bgColor = 'bg-blue-500';

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`
              aspect-square flex items-center justify-center text-2xl border border-blue-200
              ${bgColor}
            `}
          >
            {y === 0 && x === rod.x && '🎣'}
            {isRod && !isRodEnd && '|'}
            {isRodEnd && '🪝'}
            {fishHere && (fishHere.type === 'small' ? '🐟' : '🐠')}
            {trashHere && '🗑️'}
            {treasureHere && '💎'}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-blue-400 p-4">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <button className="btn btn-ghost text-white" onClick={onBack}>
            ← 돌아가기
          </button>
          <h1 className="text-3xl font-bold text-white">🎣 코딩 낚시</h1>
          <div className="text-xl text-white">⏰ {timeLeft}초</div>
        </div>

        {/* 게임 시작 */}
        {!gameActive && (
          <div className="card bg-base-100 shadow-xl mb-4">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-3xl">코딩 낚시에 오신 것을 환영합니다!</h2>
              <p className="text-lg">명령어를 조합하여 물고기와 보물을 낚으세요!</p>
              <div className="text-left mt-4">
                <p>🐟 작은 물고기: 10점</p>
                <p>🐠 큰 물고기: 20점</p>
                <p>💎 보물: 50점</p>
                <p>🗑️ 쓰레기: -5점</p>
              </div>
              <button className="btn btn-primary btn-lg mt-4" onClick={startGame}>
                🎣 게임 시작
              </button>
            </div>
          </div>
        )}

        {gameActive && (
          <>
            {/* 점수판 */}
            <div className="flex justify-center gap-4 mb-4">
              <div className="badge badge-lg badge-success">점수: {score}</div>
              <div className="badge badge-lg badge-info">🐟 {caught.fish}마리</div>
              <div className="badge badge-lg badge-warning">💎 {caught.treasure}개</div>
              <div className="badge badge-lg badge-error">🗑️ {caught.trash}개</div>
            </div>

            {/* 게임 그리드 */}
            <div className="bg-base-100 p-4 rounded-lg mb-4">
              <div
                className="grid gap-0 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))`,
                  maxWidth: '500px'
                }}
              >
                {renderGrid()}
              </div>
            </div>

            {/* 명령어 패널 */}
            <div className="card bg-base-100 shadow-xl mb-4">
              <div className="card-body">
                <h3 className="card-title">낚시 명령</h3>
                <div className="grid grid-cols-5 gap-2 mb-4">
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
                  <button
                    className="btn btn-primary"
                    onClick={() => addCommand('down')}
                    disabled={isExecuting}
                  >
                    ⬇️ 내리기
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => addCommand('up')}
                    disabled={isExecuting}
                  >
                    ⬆️ 올리기
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => addCommand('catch')}
                    disabled={isExecuting}
                  >
                    🪝 잡기
                  </button>
                </div>

                {/* 명령어 리스트 */}
                <div className="bg-gray-100 p-4 rounded-lg min-h-[60px]">
                  <div className="font-bold mb-2">명령어 순서:</div>
                  <div className="flex flex-wrap gap-2">
                    {commands.length === 0 ? (
                      <span className="text-gray-500">명령어를 추가해주세요</span>
                    ) : (
                      commands.map((cmd, idx) => (
                        <span key={idx} className="badge badge-primary badge-lg">
                          {cmd === 'left' ? '⬅️' : cmd === 'right' ? '➡️' :
                           cmd === 'down' ? '⬇️' : cmd === 'up' ? '⬆️' : '🪝'}
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
                </div>
              </div>
            </div>
          </>
        )}

        {/* 메시지 */}
        {message && (
          <div className="alert alert-success">
            <span className="text-lg">{message}</span>
          </div>
        )}

        {/* 설명 */}
        <div className="alert alert-info">
          <span>
            💡 낚시대를 움직여 물고기(🐟🐠)와 보물(💎)을 잡으세요! 쓰레기(🗑️)는 피하세요. 60초 안에 최대한 많은 점수를 획득하세요!
          </span>
        </div>
      </div>
    </div>
  );
};

export default FishingGame;
