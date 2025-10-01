import React from 'react';

const LevelSelector = ({ levels, currentLevel, completedLevels, onSelectLevel }) => {
  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">레벨 선택</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {levels.map(level => {
            const isCompleted = completedLevels.includes(level.id);
            const isCurrent = currentLevel === level.id;
            const isLocked = level.id > 1 && !completedLevels.includes(level.id - 1);

            return (
              <button
                key={level.id}
                onClick={() => !isLocked && onSelectLevel(level.id)}
                disabled={isLocked}
                className={`
                  btn btn-sm
                  ${isCurrent ? 'btn-primary' : 'btn-outline'}
                  ${isCompleted ? 'btn-success' : ''}
                  ${isLocked ? 'btn-disabled opacity-50' : ''}
                `}
              >
                {isCompleted && '✓ '}
                {isLocked && '🔒 '}
                레벨 {level.id}
                {level.difficulty && (
                  <span className="ml-1">
                    {'⭐'.repeat(level.difficulty)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelSelector;
