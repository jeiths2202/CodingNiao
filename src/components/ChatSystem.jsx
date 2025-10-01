import React, { useState, useEffect, useRef } from 'react';

const ChatSystem = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(12); // 임의의 접속자 수
  const messagesEndRef = useRef(null);

  const botMessages = [
    "오늘 던전 퍼즐 3단계 클리어했어요!",
    "희짱 너무 귀여워요 ㅎㅎ",
    "코인 1000개 모았다!",
    "레이싱 게임 어려워요 ㅠㅠ",
    "츄르 이벤트 최고!",
    "액션 퍼즐 재밌어요~",
    "낚시 게임에서 보물 잡았어요!",
    "누가 같이 게임할 사람?",
    "희짱 꾸미기 중독됐어요 ㅋㅋ",
    "코딩 공부 재밌게 하고 있어요!"
  ];

  const sampleUsers = [
    "김민준", "이서연", "박지호", "최수아", "정예준",
    "강하은", "윤도현", "임채원", "한지우", "송민서",
    "오준영", "장서현", "권태양", "조아인", "배현우"
  ];

  useEffect(() => {
    // 초기 메시지 로드
    const initialMessages = [
      {
        id: 1,
        user: "김민준",
        message: "안녕하세요! 코딩니아오 재밌네요!",
        time: "14:23",
        isBot: true
      },
      {
        id: 2,
        user: "이서연",
        message: "던전 퍼즐 클리어 했어요~",
        time: "14:25",
        isBot: true
      },
      {
        id: 3,
        user: "박지호",
        message: "희짱 꾸미기 최고!",
        time: "14:27",
        isBot: true
      }
    ];
    setMessages(initialMessages);

    // 랜덤 봇 메시지 (10-30초마다)
    const botInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
        const randomMessage = botMessages[Math.floor(Math.random() * botMessages.length)];
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

        setMessages(prev => [...prev, {
          id: Date.now(),
          user: randomUser,
          message: randomMessage,
          time,
          isBot: true
        }]);
      }
    }, Math.random() * 20000 + 10000);

    // 접속자 수 변동 (5-15초마다)
    const userInterval = setInterval(() => {
      setOnlineUsers(prev => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        return Math.max(5, Math.min(20, prev + change));
      });
    }, Math.random() * 10000 + 5000);

    return () => {
      clearInterval(botInterval);
      clearInterval(userInterval);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSetName = () => {
    if (userName.trim()) {
      setIsNameSet(true);

      // 입장 메시지
      const now = new Date();
      const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: "시스템",
        message: `${userName}님이 입장하셨습니다.`,
        time,
        isSystem: true
      }]);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    setMessages(prev => [...prev, {
      id: Date.now(),
      user: userName,
      message: inputMessage,
      time,
      isBot: false
    }]);

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isNameSet) {
        handleSendMessage();
      } else {
        handleSetName();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card bg-base-100 shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="card-body flex flex-col h-full p-0">
          {/* 헤더 */}
          <div className="bg-primary text-primary-content p-4 rounded-t-2xl flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">💬 실시간 채팅</h2>
              <p className="text-sm opacity-90">🟢 {onlineUsers}명 접속 중</p>
            </div>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* 이름 설정 */}
          {!isNameSet && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="card bg-base-200 w-full max-w-md">
                <div className="card-body">
                  <h3 className="font-bold text-xl mb-4">채팅에 참여하려면 이름을 입력하세요</h3>
                  <input
                    type="text"
                    placeholder="이름 입력"
                    className="input input-bordered mb-4"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                  />
                  <button className="btn btn-primary" onClick={handleSetName}>
                    입장하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 채팅 메시지 */}
          {isNameSet && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`chat ${msg.isSystem ? 'chat-center' : msg.user === userName ? 'chat-end' : 'chat-start'}`}
                  >
                    {!msg.isSystem && (
                      <div className="chat-header">
                        {msg.user}
                        <time className="text-xs opacity-50 ml-1">{msg.time}</time>
                      </div>
                    )}
                    <div className={`chat-bubble ${
                      msg.isSystem ? 'chat-bubble-info' :
                      msg.user === userName ? 'chat-bubble-primary' : 'chat-bubble-secondary'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력창 */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    className="input input-bordered flex-1"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button className="btn btn-primary" onClick={handleSendMessage}>
                    전송
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;
