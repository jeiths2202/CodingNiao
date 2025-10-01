class DragDropHandler {
  constructor(llmEngine, stateManager) {
    this.llm = llmEngine;
    this.state = stateManager;
    this.draggedBlockData = null;
  }

  setupDragHandlers() {
    // 팔레트 블록에 드래그 시작 이벤트
    document.querySelectorAll('.block-template').forEach(block => {
      block.addEventListener('dragstart', (e) => {
        this.draggedBlockData = {
          type: block.dataset.blockType,
          action: block.dataset.action,
          direction: block.dataset.direction,
          icon: block.dataset.icon,
          label: block.dataset.label
        };
        e.dataTransfer.effectAllowed = 'copy';
        block.classList.add('opacity-50');
      });

      block.addEventListener('dragend', (e) => {
        block.classList.remove('opacity-50');
      });
    });

    // 슬롯에 드롭 이벤트
    document.querySelectorAll('[data-slot-index]').forEach(slot => {
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('bg-primary', 'bg-opacity-20');
      });

      slot.addEventListener('dragleave', (e) => {
        slot.classList.remove('bg-primary', 'bg-opacity-20');
      });

      slot.addEventListener('drop', async (e) => {
        e.preventDefault();
        slot.classList.remove('bg-primary', 'bg-opacity-20');

        if (this.draggedBlockData) {
          await this.handleDrop(slot.id, this.draggedBlockData);
        }
      });
    });

    // 전역 removeBlock 함수 등록
    window.removeBlock = (slotId) => {
      this.state.removeBlock(slotId);
    };
  }

  async handleDrop(slotId, blockData) {
    const slot = document.getElementById(slotId);

    // 빈 슬롯이든 차있는 슬롯이든 바로 교체
    if (slot.dataset.occupied === 'false') {
      this.state.updateSlot(slotId, blockData);
      this.showFeedback('블록이 추가되었습니다', 'success');
    } else {
      this.state.updateSlot(slotId, blockData);
      this.showFeedback('블록이 교체되었습니다', 'info');
    }
  }

  showFeedback(message, type = 'info') {
    const alertTypes = {
      success: 'alert-success',
      info: 'alert-info',
      warning: 'alert-warning',
      error: 'alert-error'
    };

    const toast = document.createElement('div');
    toast.className = 'toast toast-top toast-end z-50';
    toast.innerHTML = `
      <div class="alert ${alertTypes[type]} shadow-lg">
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  cleanup() {
    delete window.removeBlock;
  }
}

export default DragDropHandler;
