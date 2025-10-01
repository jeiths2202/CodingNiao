import React, { useState, useEffect } from 'react';

const RacingGame = ({ onBack, onEarnCoins }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [carPos, setCarPos] = useState({ lane: 1, distance: 0 });
  const [obstacles, setObstacles] = useState([]);
  const [coins, setCoins] = useState([]);
  const [commands, setCommands] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [message, setMessage] = useState('');
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [fuel, setFuel] = useState(100);

  const LANES = 3;
  const RACE_LENGTH = 15;

  const levels = [
    {
      id: 1,
      name: '첫 레이스',
      obstacles: [
        { lane: 1, distance: 3 },
        { lane: 0, distance: 5 },
        { lane: 2, distance: 7 },
        { lane: 1, distance: 10 }
      ],
      coins: [
        { lane: 0, distance: 2 },
        { lane: 2, distance: 4 },
        { lane: 1, distance: 8 },
        { lane: 0, distance: 12 }
      ],
      targetCoins: 3,
      reward: 70
    },
    {
      id: 2,
      name: '스피드 챌린지',
      obstacles: [
        { lane: 1, distance: 2 },
        { lane: 0, distance: 4 },
        { lane: 2, distance: 5 },
        { lane: 1, distance: 7 },
        { lane: 0, distance: 9 },
        { lane: 2, distance: 11 }
      ],
      coins: [
        { lane: 2, distance: 1 },
        { lane: 0, distance: 3 },
        { lane: 1, distance: 6 },
        { lane: 2, distance: 8 },
        { lane: 1, distance: 13 }
      ],
      targetCoins: 4,
      reward: 90
    },
    {
      id: 3,
      name: '챔피언십',
      obstacles: [
        { lane: 1, distance: 2 },
        { lane: 0, distance: 3 },
        { lane: 2, distance: 4 },
        { lane: 1, distance: 6 },
        { lane: 0, distance: 8 },
        { lane: 2, distance: 9 },
        { lane: 1, distance: 11 },
        { lane: 0, distance: 13 }
      ],
      coins: [
        { lane: 2, distance: 1 },
        { lane: 0, distance: 5 },
        { lane: 1, distance: 7 },
        { lane: 2, distance: 10 },
        { lane: 1, distance: 12 },
        { lane: 0, distance: 14 }
      ],
      targetCoins: 5,
      reward: 120
    }
  ];

  const level = levels[currentLevel - 1];

  useEffect(() => {
    resetRace();
  }, [currentLevel]);

  const resetRace = () => {
    setCarPos({ lane: 1, distance: 0 });
    setObstacles(level.obstacles.map(o => ({ ...o, collected: false })));
    setCoins(level.coins.map(c => ({ ...c, collected: false })));
    setCommands([]);
    setCollectedCoins(0);
    setFuel(100);
    setMessage('');
  };

  const addCommand = (cmd) => {
    if (isExecuting) return;
    if (cmd === 'forward' && fuel < 10) {
      setMessage('⚠️ 연료가 부족합니다!');
      return;
    }
    setCommands([...commands, cmd]);
  };

  const clearCommands = () => {
    if (isExecuting) return;
    setCommands([]);
  };

  const executeCommands = async () => {
    if (commands.length === 0) {
      setMessage('❌ 명령어를 추가해주세요!');
      return;
    }

    setIsExecuting(true);
    setMessage('');
    let pos = { lane: 1, distance: 0 };
    let currentFuel = fuel;
    let collected = 0;
    let currentCoins = [...coins];

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];

      switch (cmd) {
        case 'left':
          pos.lane = Math.max(0, pos.lane - 1);
          break;
        case 'right':
          pos.lane = Math.min(LANES - 1, pos.lane + 1);
          break;
        case 'forward':
          pos.distance = Math.min(RACE_LENGTH, pos.distance + 1);
          currentFuel -= 10;
          setFuel(currentFuel);
          break;
        case 'turbo':
          pos.distance = Math.min(RACE_LENGTH, pos.distance + 2);
          currentFuel -= 20;
          setFuel(currentFuel);
          break;
      }

      setCarPos({ ...pos });

      // 코인 수집 체크
      const coinIndex = currentCoins.findIndex(
        c => c.lane === pos.lane && c.distance === pos.distance && !c.collected
      );
      if (coinIndex !== -1) {
        currentCoins[coinIndex].collected = true;
        collected++;
        setCollectedCoins(collected);
        setCoins([...currentCoins]);
        currentFuel = Math.min(100, currentFuel + 20); // 연료 보충
        setFuel(currentFuel);
      }

      await new Promise(resolve => setTimeout(resolve, 400));

      // 장애물 충돌 체크
      const hitObstacle = obstacles.some(
        o => o.lane === pos.lane && o.distance === pos.distance
      );
      if (hitObstacle) {
        setMessage('💥 장애물에 충돌했습니다!');
        setIsExecuting(false);
        setTimeout(resetRace, 1500);
        return;
      }

      if (currentFuel <= 0) {
        setMessage('⛽ 연료가 떨어졌습니다!');
        setIsExecuting(false);
        setTimeout(resetRace, 1500);
        return;
      }
    }

    // 결승선 도달 및 목표 코인 체크
    if (pos.distance >= RACE_LENGTH && collected >= level.targetCoins) {
      setMessage(`🏆 우승! +${level.reward} 코인`);
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
      setMessage('❌ 결승선에 도달하지 못했습니다!');
    }

    setIsExecuting(false);
  };

  const renderTrack = () => {
    const track = [];

    for (let dist = 0; dist <= RACE_LENGTH; dist++) {
      for (let lane = 0; lane < LANES; lane++) {
        const isCar = carPos.lane === lane && carPos.distance === dist;
        const isFinish = dist === RACE_LENGTH;
        const obstacle = obstacles.find(o => o.lane === lane && o.distance === dist);
        const coin = coins.find(c => c.lane === lane && c.distance === dist && !c.collected);

        track.push(
          <div
            key={`${lane}-${dist}`}
            className={`
              aspect-square flex items-center justify-center text-2xl border border-gray-400
              ${isFinish ? 'bg-yellow-300' : 'bg-gray-200'}
              ${lane === 0 ? 'border-l-4 border-l-red-500' : ''}
              ${lane === LANES - 1 ? 'border-r-4 border-r-red-500' : ''}
            `}
          >
            {isCar && '🏎️'}
            {obstacle && !isCar && '🚧'}
            {coin && !isCar && '💰'}
            {isFinish && !isCar && '🏁'}
          </div>
        );
      }
    }

    return track;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <button className="btn btn-ghost text-white" onClick={onBack}>
            ← 돌아가기
          </button>
          <h1 className="text-3xl font-bold">🏎️ 코딩 레이싱</h1>
          <div className="text-xl">레벨 {currentLevel}/3</div>
        </div>

        {/* 레벨 정보 */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">{level.name}</h2>
          <div className="flex justify-center gap-4 mt-2">
            <span className="badge badge-lg badge-info">코인: {collectedCoins}/{level.targetCoins}</span>
            <span className="badge badge-lg badge-warning">⛽ 연료: {fuel}%</span>
          </div>
        </div>

        {/* 레이싱 트랙 */}
        <div className="bg-base-100 p-4 rounded-lg mb-4 overflow-x-auto">
          <div
            className="grid gap-0 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${LANES}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${RACE_LENGTH + 1}, minmax(0, 1fr))`,
              maxWidth: '300px',
              transform: 'rotate(0deg)'
            }}
          >
            {renderTrack()}
          </div>
        </div>

        {/* 명령어 패널 */}
        <div className="card bg-base-100 shadow-xl mb-4">
          <div className="card-body">
            <h3 className="card-title text-black">레이싱 명령</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              <button
                className="btn btn-primary"
                onClick={() => addCommand('left')}
                disabled={isExecuting}
              >
                ⬅️ 좌회전
              </button>
              <button
                className="btn btn-primary"
                onClick={() => addCommand('right')}
                disabled={isExecuting}
              >
                ➡️ 우회전
              </button>
              <button
                className="btn btn-success"
                onClick={() => addCommand('forward')}
                disabled={isExecuting}
              >
                ⬆️ 전진 (-10⛽)
              </button>
              <button
                className="btn btn-warning"
                onClick={() => addCommand('turbo')}
                disabled={isExecuting}
              >
                🚀 터보 (-20⛽)
              </button>
            </div>

            {/* 명령어 리스트 */}
            <div className="bg-gray-100 p-4 rounded-lg min-h-[60px] text-black">
              <div className="font-bold mb-2">명령어 순서:</div>
              <div className="flex flex-wrap gap-2">
                {commands.length === 0 ? (
                  <span className="text-gray-500">명령어를 추가해주세요</span>
                ) : (
                  commands.map((cmd, idx) => (
                    <span key={idx} className="badge badge-primary badge-lg">
                      {cmd === 'left' ? '⬅️' : cmd === 'right' ? '➡️' :
                       cmd === 'forward' ? '⬆️' : '🚀'}
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
                {isExecuting ? '레이싱 중...' : '🏁 레이스 시작'}
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
                onClick={resetRace}
                disabled={isExecuting}
              >
                🔄 레이스 리셋
              </button>
            </div>
          </div>
        </div>

        {/* 메시지 */}
        {message && (
          <div className={`alert ${message.includes('🏆') || message.includes('🎊') ? 'alert-success' : 'alert-error'}`}>
            <span className="text-lg">{message}</span>
          </div>
        )}

        {/* 설명 */}
        <div className="alert alert-info">
          <span>
            💡 장애물(🚧)을 피하고 코인(💰)을 수집하며 결승선(🏁)까지 도달하세요! 코인을 먹으면 연료(⛽)가 +20 충전됩니다. 🚀 터보는 2칸을 한번에 이동합니다!
          </span>
        </div>
      </div>
    </div>
  );
};

export default RacingGame;
