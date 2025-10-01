export const STORAGE_KEY = 'blockCodingAppState';

export function saveToLocalStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('LocalStorage 저장 실패:', error);
    return false;
  }
}

export function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    console.error('LocalStorage 로딩 실패:', error);
    return null;
  }
}

export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('LocalStorage 삭제 실패:', error);
    return false;
  }
}

export function exportProgress(state) {
  return JSON.stringify(state, null, 2);
}

export function importProgress(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('진행 상황 가져오기 실패:', error);
    return null;
  }
}
