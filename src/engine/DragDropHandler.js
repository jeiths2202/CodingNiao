class DragDropHandler {
  constructor(llmEngine, stateManager) {
    this.llm = llmEngine;
    this.state = stateManager;
    this.draggedBlockData = null;
    this.selectedBlockData = null; // 클릭으로 선택된 블록
  }

  setupDragHandlers() {
    // 팔레트 블록에 드래그 시작 이벤트
    document.querySelectorAll('.block-template').forEach(block => {
      // 드래그 앤 드롭
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

      // 모바일/클릭 지원
      block.addEventListener('click', (e) => {
        e.preventDefault();

        // 이전 선택 해제
        document.querySelectorAll('.block-template').forEach(b => {
          b.classList.remove('ring-4', 'ring-primary');
        });

        // 현재 블록 선택
        block.classList.add('ring-4', 'ring-primary');

        this.selectedBlockData = {
          type: block.dataset.blockType,
          action: block.dataset.action,
          direction: block.dataset.direction,
          icon: block.dataset.icon,
          label: block.dataset.label
        };

        this.showFeedback('블록을 선택했습니다. 워크스페이스 슬롯을 클릭하세요.', 'info');
      });
    });

    // 슬롯에 드롭 이벤트
    document.querySelectorAll('[data-slot-index]').forEach(slot => {
      // 드래그 앤 드롭
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

      // 모바일/클릭 지원
      slot.addEventListener('click', async (e) => {
        e.preventDefault();

        if (this.selectedBlockData) {
          await this.handleDrop(slot.id, this.selectedBlockData);

          // 선택 해제
          document.querySelectorAll('.block-template').forEach(b => {
            b.classList.remove('ring-4', 'ring-primary');
          });
          this.selectedBlockData = null;
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
