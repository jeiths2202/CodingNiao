class ExecutionEngine {
  constructor(stateManager, onCharacterMove = null) {
    this.state = stateManager;
    this.character = { x: 0, y: 0, direction: 'right' };
    this.isExecuting = false;
    this.gridSize = 5;
    this.onCharacterMove = onCharacterMove; // React 상태 업데이트 콜백
  }

  async executeWorkspace() {
    if (this.isExecuting) return;
    this.isExecuting = true;

    const { blocks } = this.state.getWorkspaceState();
    const validBlocks = blocks.filter(b => b !== null);

    if (validBlocks.length === 0) {
      alert('블록을 추가하세요!');
      this.isExecuting = false;
      return;
    }

    // 캐릭터 초기화
    this.resetCharacter();

    for (let i = 0; i < validBlocks.length; i++) {
      const block = validBlocks[i];

      // 현재 실행 중인 블록 하이라이트
      this.highlightBlock(block.blockId, true);

      // 블록 실행
      await this.executeBlock(block);

      // 하이라이트 제거
      this.highlightBlock(block.blockId, false);

      // 다음 블록 전 딜레이
      await this.delay(500);
    }

    this.isExecuting = false;
    return this.character;
  }

  resetCharacter(startX = 0, startY = 0, direction = 'right') {
    this.character = { x: startX, y: startY, direction };
    this.updateCharacterUI();
  }

  async executeBlock(block) {
    switch (block.blockType) {
      case 'move':
        await this.moveCharacter();
        break;
      case 'turn':
        this.turnCharacter(block.blockDirection);
        break;
      case 'loop':
        await this.executeLoop(block);
        break;
      default:
        console.warn('알 수 없는 블록 타입:', block.blockType);
    }
  }

  async moveCharacter() {
    const directions = {
      'right': { x: 1, y: 0 },
      'left': { x: -1, y: 0 },
      'up': { x: 0, y: -1 },
      'down': { x: 0, y: 1 }
    };

    const delta = directions[this.character.direction];
    const newX = this.character.x + delta.x;
    const newY = this.character.y + delta.y;

    // 그리드 범위 확인
    if (newX >= 0 && newX < this.gridSize && newY >= 0 && newY < this.gridSize) {
      this.character.x = newX;
      this.character.y = newY;
    }

    this.updateCharacterUI();
    await this.delay(300);
  }

  turnCharacter(direction) {
    const turns = {
      'left': { 'right': 'up', 'up': 'left', 'left': 'down', 'down': 'right' },
      'right': { 'right': 'down', 'down': 'left', 'left': 'up', 'up': 'right' }
    };

    this.character.direction = turns[direction][this.character.direction];
    this.updateCharacterUI();
  }

  async executeLoop(block) {
    // 반복 블록 구현 (향후 확장)
    const loopCount = block.loopCount || 2;
    for (let i = 0; i < loopCount; i++) {
      await this.moveCharacter();
    }
  }

  updateCharacterUI() {
    // React 상태 업데이트 콜백 사용 (DOM 직접 조작 대신)
    if (this.onCharacterMove) {
      this.onCharacterMove({
        x: this.character.x,
        y: this.character.y,
        direction: this.character.direction
      });
    }

    // 상태 매니저 업데이트
    this.state.updateCharacter(this.character.x, this.character.y, this.character.direction);
  }

  highlightBlock(blockId, highlight) {
    const block = document.getElementById(blockId);
    if (block) {
      if (highlight) {
        block.classList.add('ring', 'ring-success', 'ring-offset-2');
      } else {
        block.classList.remove('ring', 'ring-success', 'ring-offset-2');
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  checkGoal(goalX, goalY) {
    return this.character.x === goalX && this.character.y === goalY;
  }

  getCurrentPosition() {
    return { ...this.character };
  }
}

export default ExecutionEngine;
