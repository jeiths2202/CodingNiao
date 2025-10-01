import React from 'react';

const GameGrid = ({ gridSize = 5, start, goal, obstacles = [], characterPosition = null }) => {
  const cells = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const isStart = start.x === x && start.y === y;
      const isGoal = goal.x === x && goal.y === y;
      const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
      const isCharacter = characterPosition && characterPosition.x === x && characterPosition.y === y;

      // 캐릭터 아이콘 방향
      const characterIcons = {
        'right': '🤖→',
        'left': '←🤖',
        'up': '🤖↑',
        'down': '↓🤖'
      };

      cells.push(
        <div
          key={`${y}-${x}`}
          id={`cell-${y}-${x}`}
          className={`
            aspect-square border-2 flex items-center justify-center text-2xl font-bold
            ${isStart ? 'bg-green-200 border-green-400' : ''}
            ${isGoal ? 'bg-yellow-200 border-yellow-400' : ''}
            ${isObstacle ? 'bg-gray-800 border-gray-900' : ''}
            ${!isStart && !isGoal && !isObstacle ? 'bg-white border-gray-300' : ''}
          `}
        >
          {isCharacter ? characterIcons[characterPosition.direction] || '🤖' : ''}
          {!isCharacter && isStart && '🏁'}
          {!isCharacter && isGoal && '🎯'}
          {!isCharacter && isObstacle && '🧱'}
        </div>
      );
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">게임 그리드</h2>
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            maxWidth: '400px'
          }}
        >
          {cells}
        </div>
        <div className="text-sm text-gray-500 mt-2">
          🏁 시작 | 🎯 목표 | 🧱 장애물
        </div>
      </div>
    </div>
  );
};

export default GameGrid;
