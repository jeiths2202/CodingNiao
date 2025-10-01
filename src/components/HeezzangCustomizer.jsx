import React, { useState } from 'react';

const HeezzangCustomizer = ({
  customization,
  coins,
  currentCustomization,
  onPurchase,
  onEquip,
  onBack
}) => {
  const [selectedTab, setSelectedTab] = useState('head');

  const categories = [
    { id: 'head', name: '모자/머리', items: customization.accessories.filter(i => i.category === 'head') },
    { id: 'accessory', name: '악세서리', items: customization.accessories.filter(i => i.category === 'accessory') },
    { id: 'background', name: '배경', items: customization.backgrounds }
  ];

  const currentCategory = categories.find(c => c.id === selectedTab);

  const handleItemClick = (item) => {
    if (!item.unlocked) {
      if (coins >= item.price) {
        onPurchase(item.id, item.category, item.price);
      } else {
        alert('코인이 부족합니다!');
      }
    } else {
      onEquip(item.id, item.category);
    }
  };

  const getCurrentPreview = () => {
    return (
      <div className="relative flex items-center justify-center w-full h-64">
        <img
          src={`${import.meta.env.BASE_URL}images/heezzang.png`}
          alt="희짱"
          className="max-w-full max-h-full object-contain"
          style={{ objectPosition: 'center' }}
        />
        {/* 악세서리 오버레이 */}
        {currentCustomization.currentAccessory && (
          <div className="absolute top-0 right-4 text-6xl transform -translate-y-2">
            {currentCustomization.currentAccessory}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <button className="btn btn-ghost" onClick={onBack}>
            ← 돌아가기
          </button>
          <div className="badge badge-warning badge-lg">
            💰 {coins} 코인
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-8">
          👗 희짱 꾸미기
        </h1>

        {/* 희짱 프리뷰 */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body items-center">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 mb-4">
              {getCurrentPreview()}
            </div>
            <p className="text-lg font-semibold">나의 희짱</p>
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="tabs tabs-boxed mb-6 justify-center">
          {categories.map(cat => (
            <a
              key={cat.id}
              className={`tab tab-lg ${selectedTab === cat.id ? 'tab-active' : ''}`}
              onClick={() => setSelectedTab(cat.id)}
            >
              {cat.name}
            </a>
          ))}
        </div>

        {/* 아이템 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentCategory?.items.map(item => {
            const isEquipped =
              (item.category === 'head' && currentCustomization.currentHead === item.icon) ||
              (item.category === 'accessory' && currentCustomization.currentAccessory === item.icon) ||
              (item.category === 'background' && currentCustomization.currentBackground === item.emoji);

            return (
              <div
                key={item.id}
                className={`
                  card bg-base-100 shadow-md cursor-pointer transition-all
                  ${item.unlocked ? 'hover:scale-105' : 'opacity-70'}
                  ${isEquipped ? 'ring-2 ring-success' : ''}
                `}
                onClick={() => handleItemClick(item)}
              >
                <div className="card-body items-center text-center p-4">
                  <div className="text-5xl mb-2">
                    {item.icon || item.emoji}
                  </div>
                  <h3 className="font-bold text-sm">{item.name}</h3>

                  {!item.unlocked ? (
                    <div className="badge badge-warning gap-1">
                      💰 {item.price}
                    </div>
                  ) : isEquipped ? (
                    <div className="badge badge-success">
                      ✓ 착용중
                    </div>
                  ) : (
                    <div className="badge badge-ghost">
                      착용하기
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 안내 */}
        <div className="alert alert-info mt-8">
          <span>
            💡 레벨을 클리어하면 코인을 얻을 수 있어요! 코인으로 희짱을 멋지게 꾸며보세요.
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeezzangCustomizer;
