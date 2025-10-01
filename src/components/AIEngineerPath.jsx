import React, { useState, useEffect } from 'react';
import aiPathData from '../data/aiEngineerPath.json';

const AIEngineerPath = ({ onBack, onEarnCoins }) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    // LocalStorage에서 진행상황 로드
    const saved = localStorage.getItem('aiEngineerProgress');
    if (saved) {
      setCompletedLessons(JSON.parse(saved));
    }
  }, []);

  const saveProgress = (lessonId) => {
    const updated = [...new Set([...completedLessons, lessonId])];
    setCompletedLessons(updated);
    localStorage.setItem('aiEngineerProgress', JSON.stringify(updated));
  };

  const handleLessonComplete = () => {
    setShowQuiz(true);
  };

  const handleQuizSubmit = () => {
    const lesson = currentLesson;
    const isCorrect = selectedAnswer === lesson.quiz.answer;

    setQuizResult(isCorrect);

    if (isCorrect) {
      saveProgress(lesson.id);
      onEarnCoins(20); // 정답 시 20코인
      setTimeout(() => {
        setShowQuiz(false);
        setCurrentLesson(null);
        setQuizResult(null);
        setSelectedAnswer(null);
      }, 2000);
    }
  };

  const handleRetry = () => {
    setQuizResult(null);
    setSelectedAnswer(null);
  };

  const stages = aiPathData.stages;
  const stage = stages[currentStage - 1];

  const getProgress = () => {
    const totalLessons = stages.reduce((sum, s) => sum + s.lessons.length, 0);
    const completed = completedLessons.length;
    return Math.round((completed / totalLessons) * 100);
  };

  if (currentLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setCurrentLesson(null);
                setShowQuiz(false);
                setQuizResult(null);
                setSelectedAnswer(null);
              }}
            >
              ← 목록으로
            </button>
            <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
            <div></div>
          </div>

          {/* 학습 내용 */}
          {!showQuiz ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="prose max-w-none">
                  {currentLesson.content.split('\n').map((line, idx) => {
                    // 코드 블록 처리
                    if (line.startsWith('```')) {
                      return null;
                    }
                    // 제목 처리
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h3 key={idx} className="text-xl font-bold mt-4 mb-2 text-primary">
                          {line.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    // 코드 라인 처리
                    if (line.startsWith('- ') || line.startsWith('  -')) {
                      return (
                        <li key={idx} className="ml-4">
                          {line.replace(/^[\s-]+/, '')}
                        </li>
                      );
                    }
                    // 일반 텍스트
                    return line ? <p key={idx}>{line}</p> : <br key={idx} />;
                  })}
                </div>

                <div className="card-actions justify-end mt-6">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleLessonComplete}
                  >
                    학습 완료! 퀴즈 풀기 →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 퀴즈 */
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">✏️ 퀴즈</h2>
                <p className="text-lg font-semibold mb-4">{currentLesson.quiz.question}</p>

                <div className="space-y-3">
                  {currentLesson.quiz.options.map((option, idx) => (
                    <button
                      key={idx}
                      className={`btn btn-outline w-full justify-start text-left h-auto py-4 ${
                        selectedAnswer === idx ? 'btn-primary' : ''
                      } ${
                        quizResult !== null
                          ? idx === currentLesson.quiz.answer
                            ? 'btn-success'
                            : selectedAnswer === idx
                            ? 'btn-error'
                            : ''
                          : ''
                      }`}
                      onClick={() => quizResult === null && setSelectedAnswer(idx)}
                      disabled={quizResult !== null}
                    >
                      <span className="font-bold mr-2">{idx + 1}.</span>
                      {option}
                    </button>
                  ))}
                </div>

                {quizResult === null ? (
                  <button
                    className="btn btn-success btn-lg mt-6"
                    onClick={handleQuizSubmit}
                    disabled={selectedAnswer === null}
                  >
                    정답 확인
                  </button>
                ) : quizResult ? (
                  <div className="alert alert-success mt-6">
                    <span className="text-lg">
                      🎉 정답입니다! +20 코인을 획득했어요!
                    </span>
                  </div>
                ) : (
                  <div className="alert alert-error mt-6">
                    <div className="flex justify-between items-center w-full">
                      <span>❌ 틀렸어요. 다시 도전해보세요!</span>
                      <button className="btn btn-sm" onClick={handleRetry}>
                        다시 풀기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <button className="btn btn-ghost" onClick={onBack}>
            ← 돌아가기
          </button>
          <h1 className="text-3xl font-bold">🤖 나도 AI 엔지니어</h1>
          <div className="text-xl">진행률: {getProgress()}%</div>
        </div>

        {/* 전체 진행률 */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">전체 학습 진행도</span>
              <span>{completedLessons.length}/{stages.reduce((sum, s) => sum + s.lessons.length, 0)} 완료</span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={completedLessons.length}
              max={stages.reduce((sum, s) => sum + s.lessons.length, 0)}
            ></progress>
          </div>
        </div>

        {/* 스테이지 선택 */}
        <div className="tabs tabs-boxed mb-6 justify-center">
          {stages.map((s) => (
            <a
              key={s.id}
              className={`tab tab-lg ${currentStage === s.id ? 'tab-active' : ''}`}
              onClick={() => setCurrentStage(s.id)}
            >
              {s.icon} {s.title}
            </a>
          ))}
        </div>

        {/* 현재 스테이지 정보 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {stage.icon} {stage.title}
          </h2>
          <p className="text-gray-600">{stage.description}</p>
        </div>

        {/* 레슨 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stage.lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                className={`card bg-base-100 shadow-xl cursor-pointer transition-all ${
                  isCompleted ? 'border-2 border-success' : ''
                } hover:scale-105`}
                onClick={() => setCurrentLesson(lesson)}
              >
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h3 className="card-title">{lesson.title}</h3>
                    {isCompleted && <span className="text-3xl">✅</span>}
                  </div>
                  <p className="text-sm text-gray-600">
                    {lesson.content.substring(0, 100)}...
                  </p>
                  <div className="card-actions justify-between items-center mt-4">
                    <div className="badge badge-primary">퀴즈 1문제</div>
                    <button className="btn btn-sm btn-primary">
                      {isCompleted ? '복습하기' : '학습하기'} →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 안내 */}
        <div className="alert alert-info mt-8">
          <span>
            💡 각 레슨을 완료하고 퀴즈를 맞히면 20코인을 획득해요! 기초부터 차근차근 배워서 AI 엔지니어가 되어보세요!
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIEngineerPath;
