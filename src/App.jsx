import { useState, useEffect, useRef } from 'react';
import './index.css';

// Components
import MainMenu from './components/MainMenu';
import BlockCodingGame from './components/BlockCodingGame';
import HeezzangCustomizer from './components/HeezzangCustomizer';
import HeezzangAdventure from './components/HeezzangAdventure';
import ChuruEvent from './components/ChuruEvent';
import DungeonPuzzle from './components/DungeonPuzzle';
import ActionPuzzle from './components/ActionPuzzle';
import FishingGame from './components/FishingGame';
import RacingGame from './components/RacingGame';
import AIEngineerPath from './components/AIEngineerPath';
import AIChatbot from './components/AIChatbot';

// Data
import contentsData from './data/contents.json';
import heezzangData from './data/heezzangCustomization.json';

function App() {
  const [currentContent, setCurrentContent] = useState('main-menu');
  const [showChuruEvent, setShowChuruEvent] = useState(false);

  // 게임 상태
  const [coins, setCoins] = useState(0);
  const [contents, setContents] = useState(contentsData);

  // 희짱 커스터마이제이션
  const [heezzangCustomization, setHeezzangCustomization] = useState({
    currentHead: '😺',
    currentAccessory: null,
    currentBackground: '🏡',
    ownedItems: heezzangData
  });

  useEffect(() => {
    // 저장된 데이터 로드
    const savedData = localStorage.getItem('codingNiaoData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setCoins(parsed.coins || 0);
      setHeezzangCustomization(parsed.heezzangCustomization || heezzangCustomization);

      // 잠금 해제된 콘텐츠 업데이트
      if (parsed.unlockedContents) {
        setContents(contents.map(c => ({
          ...c,
          unlocked: parsed.unlockedContents.includes(c.id) || c.unlocked
        })));
      }
    }
  }, []);

  // 데이터 저장
  useEffect(() => {
    const dataToSave = {
      coins,
      heezzangCustomization,
      unlockedContents: contents.filter(c => c.unlocked).map(c => c.id)
    };
    localStorage.setItem('codingNiaoData', JSON.stringify(dataToSave));
  }, [coins, heezzangCustomization, contents]);


  const handleEarnCoins = (amount) => {
    setCoins(prev => prev + amount);
  };

  const handlePurchaseItem = (itemId, category, price) => {
    if (coins >= price) {
      setCoins(prev => prev - price);

      const newCustomization = { ...heezzangCustomization };

      if (category === 'head' || category === 'accessory') {
        const itemIndex = newCustomization.ownedItems.accessories.findIndex(i => i.id === itemId);
        if (itemIndex !== -1) {
          newCustomization.ownedItems.accessories[itemIndex].unlocked = true;
        }
      } else if (category === 'background') {
        const itemIndex = newCustomization.ownedItems.backgrounds.findIndex(i => i.id === itemId);
        if (itemIndex !== -1) {
          newCustomization.ownedItems.backgrounds[itemIndex].unlocked = true;
        }
      }

      setHeezzangCustomization(newCustomization);
    }
  };

  const handleEquipItem = (itemId, category) => {
    const newCustomization = { ...heezzangCustomization };

    if (category === 'head') {
      const item = heezzangCustomization.ownedItems.accessories.find(i => i.id === itemId);
      newCustomization.currentHead = item?.icon || '😺';
    } else if (category === 'accessory') {
      const item = heezzangCustomization.ownedItems.accessories.find(i => i.id === itemId);
      newCustomization.currentAccessory = item?.icon || null;
    } else if (category === 'background') {
      const item = heezzangCustomization.ownedItems.backgrounds.find(i => i.id === itemId);
      newCustomization.currentBackground = item?.emoji || '🏡';
    }

    setHeezzangCustomization(newCustomization);
  };

  const renderContent = () => {
    switch (currentContent) {
      case 'main-menu':
        return (
          <MainMenu
            contents={contents}
            onSelectContent={setCurrentContent}
            coins={coins}
            heezzangCustomization={heezzangCustomization}
            onOpenEvent={() => setShowChuruEvent(true)}
          />
        );

      case 'block-coding':
        return (
          <BlockCodingGame
            onEarnCoins={handleEarnCoins}
            onBack={() => setCurrentContent('main-menu')}
          />
        );

      case 'heezzang-dress':
        return (
          <HeezzangCustomizer
            customization={heezzangCustomization.ownedItems}
            coins={coins}
            currentCustomization={heezzangCustomization}
            onPurchase={handlePurchaseItem}
            onEquip={handleEquipItem}
            onBack={() => setCurrentContent('main-menu')}
          />
        );

      case 'heezzang-adventure':
        return (
          <HeezzangAdventure
            onBack={() => setCurrentContent('main-menu')}
            onEarnCoins={handleEarnCoins}
          />
        );

      case 'dungeon-puzzle':
        return (
          <DungeonPuzzle
            onBack={() => setCurrentContent('main-menu')}
            onEarnCoins={handleEarnCoins}
          />
        );

      case 'action-puzzle':
        return (
          <ActionPuzzle
            onBack={() => setCurrentContent('main-menu')}
            onEarnCoins={handleEarnCoins}
          />
        );

      case 'fishing-game':
        return (
          <FishingGame
            onBack={() => setCurrentContent('main-menu')}
            onEarnCoins={handleEarnCoins}
          />
        );

      case 'racing-game':
        return (
          <RacingGame
            onBack={() => setCurrentContent('main-menu')}
            onEarnCoins={handleEarnCoins}
          />
        );

      case 'ai-engineer':
        return (
          <AIEngineerPath
            onBack={() => setCurrentContent('main-menu')}
            onEarnCoins={handleEarnCoins}
          />
        );

      case 'ai-chatbot':
        return (
          <AIChatbot
            onBack={() => setCurrentContent('main-menu')}
            onEarnCoins={handleEarnCoins}
          />
        );

      case 'room-decoration':
      case 'farm-game':
        return (
          <div className="min-h-screen bg-base-100 flex items-center justify-center">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <h2 className="card-title text-3xl mb-4">🚧 준비 중입니다</h2>
                <p className="mb-4">이 콘텐츠는 곧 추가될 예정입니다!</p>
                <button className="btn btn-primary" onClick={() => setCurrentContent('main-menu')}>
                  메인 메뉴로
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return <MainMenu contents={contents} onSelectContent={setCurrentContent} />;
    }
  };

  return (
    <>
      {showChuruEvent && (
        <ChuruEvent
          onClaim={handleEarnCoins}
          onClose={() => setShowChuruEvent(false)}
        />
      )}
      {renderContent()}
    </>
  );
}

export default App;
