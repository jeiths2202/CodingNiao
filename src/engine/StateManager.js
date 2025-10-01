class StateManager {
  constructor() {
    this.state = {
      blocks: [],
      character: { x: 0, y: 0, direction: 'right' },
      currentLevel: 1,
      xp: 0,
      badges: [],
      completedLevels: []
    };
    this.loadFromLocalStorage();
  }

  getWorkspaceState() {
    return {
      blocks: this.state.blocks,
      character: { ...this.state.character }
    };
  }

  getFullState() {
    return { ...this.state };
  }

  updateSlot(slotId, blockData) {
    const slotIndex = parseInt(slotId.replace('slot-', ''));

    // 슬롯 번호에 맞게 블록 배열 확장
    while (this.state.blocks.length <= slotIndex) {
      this.state.blocks.push(null);
    }

    // 블록 데이터 저장
    this.state.blocks[slotIndex] = {
      blockId: `block-${Date.now()}-${slotIndex}`,
      blockType: blockData.type,
      blockAction: blockData.action,
      blockDirection: blockData.direction,
      icon: blockData.icon,
      label: blockData.label
    };

    // DOM 업데이트
    const slot = document.getElementById(slotId);
    if (slot) {
      slot.dataset.occupied = 'true';
      slot.innerHTML = `
        <div class="badge badge-primary badge-lg gap-2" id="${this.state.blocks[slotIndex].blockId}">
          <span>${blockData.icon}</span>
          <span>${blockData.label}</span>
          <button class="btn btn-ghost btn-xs" onclick="window.removeBlock('${slotId}')">✕</button>
        </div>
      `;
    }

    this.saveToLocalStorage();
  }

  removeBlock(slotId) {
    const slotIndex = parseInt(slotId.replace('slot-', ''));
    this.state.blocks[slotIndex] = null;

    const slot = document.getElementById(slotId);
    if (slot) {
      slot.dataset.occupied = 'false';
      slot.innerHTML = `<div class="text-gray-400">블록을 드래그하세요</div>`;
    }

    this.saveToLocalStorage();
  }

  clearWorkspace() {
    this.state.blocks = [];

    document.querySelectorAll('[data-slot-index]').forEach(slot => {
      slot.dataset.occupied = 'false';
      slot.innerHTML = `<div class="text-gray-400">블록을 드래그하세요</div>`;
    });

    this.saveToLocalStorage();
  }

  resetCharacter(startX = 0, startY = 0, direction = 'right') {
    this.state.character = { x: startX, y: startY, direction };
  }

  updateCharacter(x, y, direction) {
    this.state.character = { x, y, direction };
  }

  completeLevel(levelId, earnedXP) {
    if (!this.state.completedLevels.includes(levelId)) {
      this.state.completedLevels.push(levelId);
    }

    this.state.xp += earnedXP;
    this.checkBadges();
    this.saveToLocalStorage();
  }

  checkBadges() {
    const badges = [
      { id: 'first-win', name: '첫 성공', condition: () => this.state.completedLevels.length >= 1 },
      { id: 'five-levels', name: '레벨 5 클리어', condition: () => this.state.completedLevels.length >= 5 },
      { id: 'xp-100', name: 'XP 100 달성', condition: () => this.state.xp >= 100 },
      { id: 'xp-500', name: 'XP 500 달성', condition: () => this.state.xp >= 500 }
    ];

    badges.forEach(badge => {
      if (badge.condition() && !this.state.badges.includes(badge.id)) {
        this.state.badges.push(badge.id);
        this.showBadgeNotification(badge.name);
      }
    });
  }

  showBadgeNotification(badgeName) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-top toast-center';
    toast.innerHTML = `
      <div class="alert alert-success">
        <span>🏆 배지 획득: ${badgeName}</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('blockCodingAppState', JSON.stringify(this.state));
    } catch (error) {
      console.error('LocalStorage 저장 실패:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('blockCodingAppState');
      if (saved) {
        const loadedState = JSON.parse(saved);
        this.state = { ...this.state, ...loadedState };
      }
    } catch (error) {
      console.error('LocalStorage 로딩 실패:', error);
    }
  }

  exportProgress() {
    return JSON.stringify(this.state, null, 2);
  }

  importProgress(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.state = { ...this.state, ...imported };
      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('진행 상황 가져오기 실패:', error);
      return false;
    }
  }

  resetProgress() {
    this.state = {
      blocks: [],
      character: { x: 0, y: 0, direction: 'right' },
      currentLevel: 1,
      xp: 0,
      badges: [],
      completedLevels: []
    };
    this.saveToLocalStorage();
  }
}

export default StateManager;
