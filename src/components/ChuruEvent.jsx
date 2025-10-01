import React, { useState, useEffect } from 'react';

const ChuruEvent = ({ onClaim, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClaim = () => {
    setShowConfetti(true);

    // 코인 지급
    onClaim(100);

    // 3초 후 축하 효과 제거
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card bg-base-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="card-body">
          {/* 닫기 버튼 */}
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>

          {/* 이벤트 헤더 */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold mb-2">🎉 오픈 기념 이벤트!</h2>
            <p className="text-xl text-primary">희짱에게 츄르 주기</p>
          </div>

          {/* 영상 */}
          <div className="rounded-2xl overflow-hidden mb-4 bg-gray-100">
            <video
              className="w-full h-auto"
              controls
              autoPlay
              loop
              muted
              playsInline
            >
              <source src={`${import.meta.env.BASE_URL}images/video-1759317142958.mp4`} type="video/mp4" />
              희짱이 츄르 먹는 영상
            </video>
          </div>

          {/* 이벤트 설명 */}
          <div className="alert alert-info mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>희짱이가 츄르를 먹고 있어요! 츄르를 주면 감사의 선물로 코인 100개를 드려요!</span>
          </div>

          {/* 츄르 주기 버튼 */}
          <button
            className="btn btn-primary btn-lg w-full text-xl"
            onClick={handleClaim}
          >
            🍖 츄르 주기 (코인 100개 받기)
          </button>

          {/* 축하 효과 */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
              <div className="text-8xl animate-bounce">
                🎉💰🎉
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChuruEvent;
