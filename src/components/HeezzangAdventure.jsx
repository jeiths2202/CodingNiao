import React, { useState, useEffect } from 'react';

const HeezzangAdventure = ({ onBack, onEarnCoins }) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [heezzangPos, setHeezzangPos] = useState({ x: 0, y: 0 });
  const [inventory, setInventory] = useState([]);
  const [dialogue, setDialogue] = useState('');
  const [showDialogue, setShowDialogue] = useState(false);

  const stages = [
    {
      id: 1,
      name: '희짱의 집',
      description: '희짱이의 모험이 시작되는 곳',
      map: [
        ['🏠', '🌳', '🌳', '🌳', '🌳'],
        ['🌳', '⭐', '🌳', '🎁', '🌳'],
        ['🌳', '🌳', '🌳', '🌳', '🌳'],
        ['🌳', '🐟', '🌳', '🍖', '🌳'],
        ['🌳', '🌳', '🌳', '🌳', '🚪']
      ],
      goal: { x: 4, y: 4 },
      reward: 30,
      items: [
        { pos: { x: 1, y: 1 }, emoji: '⭐', name: '반짝이', coins: 5 },
        { pos: { x: 3, y: 1 }, emoji: '🎁', name: '선물상자', coins: 10 },
        { pos: { x: 1, y: 3 }, emoji: '🐟', name: '생선', coins: 8 },
        { pos: { x: 3, y: 3 }, emoji: '🍖', name: '츄르', coins: 15 }
      ]
    },
    {
      id: 2,
      name: '신비한 숲',
      description: '보물이 숨겨진 숲속',
      map: [
        ['🏁', '🌲', '🌲', '💎', '🌲'],
        ['🌲', '⭐', '🌲', '🌲', '🌲'],
        ['🌲', '🌲', '🎁', '🌲', '🌲'],
        ['💎', '🌲', '🌲', '⭐', '🌲'],
        ['🌲', '🌲', '🌲', '🌲', '🚪']
      ],
      goal: { x: 4, y: 4 },
      reward: 50,
      items: [
        { pos: { x: 3, y: 0 }, emoji: '💎', name: '다이아몬드', coins: 20 },
        { pos: { x: 1, y: 1 }, emoji: '⭐', name: '별', coins: 10 },
        { pos: { x: 2, y: 2 }, emoji: '🎁', name: '보물상자', coins: 15 },
        { pos: { x: 0, y: 3 }, emoji: '💎', name: '다이아몬드', coins: 20 },
        { pos: { x: 3, y: 3 }, emoji: '⭐', name: '별', coins: 10 }
      ]
    }
  ];

  const stage = stages[currentStage - 1];

  const moveHeezzang = (direction) => {
    let newX = heezzangPos.x;
    let newY = heezzangPos.y;

    switch (direction) {
      case 'up':
        newY = Math.max(0, heezzangPos.y - 1);
        break;
      case 'down':
        newY = Math.min(4, heezzangPos.y + 1);
        break;
      case 'left':
        newX = Math.max(0, heezzangPos.x - 1);
        break;
      case 'right':
        newX = Math.min(4, heezzangPos.x + 1);
        break;
    }

    setHeezzangPos({ x: newX, y: newY });

    // 아이템 수집 체크
    const item = stage.items.find(i => i.pos.x === newX && i.pos.y === newY);
    if (item && !inventory.includes(item.name)) {
      collectItem(item);
    }

    // 골 도착 체크
    if (newX === stage.goal.x && newY === stage.goal.y) {
      completeStage();
    }
  };

  const collectItem = (item) => {
    setInventory([...inventory, item.name]);
    onEarnCoins(item.coins);
    showMessage(`${item.emoji} ${item.name}을(를) 발견했어요! +${item.coins} 코인`);
  };

  const completeStage = () => {
    onEarnCoins(stage.reward);
    showMessage(`🎉 스테이지 ${stage.id} 클리어! +${stage.reward} 코인`);

    setTimeout(() => {
      if (currentStage < stages.length) {
        setCurrentStage(currentStage + 1);
        setHeezzangPos({ x: 0, y: 0 });
        setInventory([]);
      } else {
        showMessage('🏆 모든 스테이지를 클리어했어요!');
      }
    }, 2000);
  };

  const showMessage = (msg) => {
    setDialogue(msg);
    setShowDialogue(true);
    setTimeout(() => setShowDialogue(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <button className="btn btn-ghost" onClick={onBack}>
            ← 돌아가기
          </button>
          <h1 className="text-3xl font-bold">🗺️ 희짱 어드벤처</h1>
          <div className="w-24"></div>
        </div>

        {/* 스테이지 정보 */}
        <div className="card bg-base-100 shadow-xl mb-4">
          <div className="card-body">
            <h2 className="card-title">
              스테이지 {stage.id}: {stage.name}
            </h2>
            <p className="text-gray-600">{stage.description}</p>
            <div className="flex gap-2 mt-2">
              <div className="badge badge-primary">보상: {stage.reward} 코인</div>
              <div className="badge badge-secondary">수집: {inventory.length}/{stage.items.length}</div>
            </div>
          </div>
        </div>

        {/* 게임 맵 */}
        <div className="card bg-base-100 shadow-xl mb-4">
          <div className="card-body">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {stage.map.map((row, y) =>
                row.map((cell, x) => {
                  const isHeezzang = heezzangPos.x === x && heezzangPos.y === y;
                  const item = stage.items.find(i => i.pos.x === x && i.pos.y === y);
                  const collected = item && inventory.includes(item.name);

                  return (
                    <div
                      key={`${y}-${x}`}
                      className={`
                        aspect-square border-2 flex items-center justify-center text-3xl
                        ${isHeezzang ? 'bg-yellow-200 border-yellow-400 animate-bounce' : 'bg-green-50 border-green-200'}
                      `}
                    >
                      {isHeezzang ? '😺' : collected ? '' : cell}
                    </div>
                  );
                })
              )}
            </div>

            {/* 컨트롤 */}
            <div className="flex flex-col items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => moveHeezzang('up')}
              >
                ↑
              </button>
              <div className="flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => moveHeezzang('left')}
                >
                  ←
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => moveHeezzang('down')}
                >
                  ↓
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => moveHeezzang('right')}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 인벤토리 */}
        {inventory.length > 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="font-bold">🎒 수집한 아이템</h3>
              <div className="flex flex-wrap gap-2">
                {inventory.map((item, idx) => (
                  <div key={idx} className="badge badge-lg badge-success">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 대화창 */}
        {showDialogue && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="alert alert-success shadow-lg animate-pulse">
              <span className="text-lg">{dialogue}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeezzangAdventure;
