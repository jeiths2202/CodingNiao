import React from 'react';

const BlockPalette = ({ availableBlocks, blocksData }) => {
  const blocks = blocksData.filter(block => availableBlocks.includes(block.id));

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">블록 팔레트</h2>
        <div className="flex flex-wrap gap-2">
          {blocks.map(block => (
            <div
              key={block.id}
              className={`badge badge-${block.color} badge-lg gap-2 cursor-move block-template p-4`}
              draggable="true"
              data-block-type={block.type}
              data-action={block.action}
              data-direction={block.direction}
              data-icon={block.icon}
              data-label={block.label}
            >
              <span className="text-xl">{block.icon}</span>
              <span>{block.label}</span>
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-500 mt-2">
          💡 블록을 클릭하거나 드래그해서 워크스페이스에 놓으세요
        </div>
      </div>
    </div>
  );
};

export default BlockPalette;
