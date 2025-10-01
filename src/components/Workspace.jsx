import React from 'react';

const Workspace = ({ maxBlocks = 10 }) => {
  const slots = Array.from({ length: maxBlocks }, (_, i) => i);

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">워크스페이스</h2>
        <div className="space-y-2">
          {slots.map(index => (
            <div
              key={index}
              id={`slot-${index}`}
              className="border-2 border-dashed border-gray-400 rounded-lg p-4 min-h-[60px] flex items-center justify-center transition-all hover:border-primary"
              data-slot-index={index}
              data-occupied="false"
            >
              <div className="text-gray-400">블록을 드래그하세요</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workspace;
