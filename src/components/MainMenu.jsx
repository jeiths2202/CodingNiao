import React, { useState } from 'react';
import leaderboardData from '../data/leaderboard.json';
import ReviewSystem from './ReviewSystem';
import ChatSystem from './ChatSystem';

const MainMenu = ({ contents, onSelectContent, coins, heezzangCustomization, onOpenEvent }) => {
  const [showReviews, setShowReviews] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [onlineUsers] = useState(Math.floor(Math.random() * 10) + 8); // 8-17명
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">
            😺 CodingNiao
          </h1>
          <p className="text-xl text-gray-600">희짱과 함께하는 코딩앱</p>

          {/* 코인 & 희짱 상태 */}
          <div className="flex justify-center gap-4 mt-4">
            <div className="badge badge-warning badge-lg gap-2">
              <span>💰</span>
              <span>{coins} 코인</span>
            </div>
            <div className="badge badge-primary badge-lg gap-2">
              <span>{heezzangCustomization.currentHead || '😺'}</span>
              <span>희짱</span>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <button
              className="btn btn-success btn-lg gap-2 animate-pulse"
              onClick={onOpenEvent}
            >
              🎉 오픈 이벤트: 희짱에게 츄르 주기!
            </button>
            <button
              className="btn btn-info btn-lg gap-2"
              onClick={() => setShowReviews(true)}
            >
              📝 사용자 후기
            </button>
            <button
              className="btn btn-secondary btn-lg gap-2"
              onClick={() => setShowChat(true)}
            >
              💬 채팅 (🟢 {onlineUsers}명)
            </button>
          </div>
        </header>

        {/* 희짱 캐릭터 & 랭킹 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* 희짱 캐릭터 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="relative mb-2 w-full h-48 overflow-hidden rounded-lg">
                <img
                  src={`${import.meta.env.BASE_URL}images/heezzang.png`}
                  alt="희짱"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center' }}
                />
                {/* 악세서리 오버레이 */}
                {heezzangCustomization.currentAccessory && (
                  <div className="absolute -top-2 -right-2 text-4xl">
                    {heezzangCustomization.currentAccessory}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">희짱이 기다리고 있어요!</p>
            </div>
          </div>

          {/* 코인 랭킹 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">🏆 코인 보유 TOP 5</h2>
              <div className="space-y-2">
                {leaderboardData.map((player) => (
                  <div
                    key={player.rank}
                    className={`
                      flex items-center justify-between p-3 rounded-lg
                      ${player.rank === 1 ? 'bg-yellow-100 border-2 border-yellow-400' :
                        player.rank === 2 ? 'bg-gray-100 border-2 border-gray-400' :
                        player.rank === 3 ? 'bg-orange-100 border-2 border-orange-400' :
                        'bg-base-200'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">
                        {player.rank === 1 ? '🥇' :
                         player.rank === 2 ? '🥈' :
                         player.rank === 3 ? '🥉' :
                         `${player.rank}위`}
                      </span>
                      <span className="font-semibold">{player.name}</span>
                    </div>
                    <div className="badge badge-warning gap-1">
                      💰 {player.coins.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contents.map(content => (
            <div
              key={content.id}
              className={`
                card bg-base-100 shadow-xl cursor-pointer transition-all
                ${content.unlocked
                  ? 'hover:scale-105 hover:shadow-2xl'
                  : 'opacity-60 cursor-not-allowed'
                }
              `}
              onClick={() => content.unlocked && onSelectContent(content.id)}
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title">
                    <span className="text-3xl mr-2">{content.icon}</span>
                    {content.title}
                  </h2>
                  {!content.unlocked && (
                    <span className="text-2xl">🔒</span>
                  )}
                </div>
                <p className="text-gray-600">{content.description}</p>
                <div className="card-actions justify-between items-center mt-4">
                  <div className={`badge badge-${content.color}`}>
                    {content.difficulty}
                  </div>
                  {content.unlocked ? (
                    <button className="btn btn-sm btn-primary">
                      시작하기
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-disabled">
                      잠금 해제 필요
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 안내 메시지 */}
        <div className="alert alert-info mt-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>
            💡 레벨을 클리어하면 코인을 얻고 새로운 콘텐츠를 잠금 해제할 수 있어요!
          </span>
        </div>

        {/* 푸터 */}
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>희짱과 함께 즐겁게 코딩을 배워보아요! 🐱</p>
        </footer>
      </div>

      {/* 모달들 */}
      {showReviews && <ReviewSystem onClose={() => setShowReviews(false)} />}
      {showChat && <ChatSystem onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default MainMenu;
