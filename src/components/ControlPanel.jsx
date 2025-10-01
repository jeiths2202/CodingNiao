import React from 'react';

const ControlPanel = ({
  onExecute,
  onClear,
  onHint,
  isExecuting,
  xp,
  badges
}) => {
  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">컨트롤</h2>

        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-success flex-1"
            onClick={onExecute}
            disabled={isExecuting}
          >
            {isExecuting ? '실행 중...' : '▶️ 실행'}
          </button>

          <button
            className="btn btn-warning"
            onClick={onClear}
            disabled={isExecuting}
          >
            🗑️ 초기화
          </button>

          <button
            className="btn btn-info flex-1"
            onClick={onHint}
            disabled={isExecuting}
          >
            💡 힌트
          </button>
        </div>

        <div className="divider"></div>

        <div className="stats stats-vertical shadow">
          <div className="stat">
            <div className="stat-title">경험치 (XP)</div>
            <div className="stat-value text-primary">{xp}</div>
          </div>

          <div className="stat">
            <div className="stat-title">획득 배지</div>
            <div className="stat-value text-2xl">
              {badges.length > 0 ? badges.map(b => '🏆').join(' ') : '없음'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
