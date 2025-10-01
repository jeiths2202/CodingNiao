import React, { useState, useEffect } from 'react';
import reviewsData from '../data/reviews.json';

const ReviewSystem = ({ onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    content: ''
  });
  const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1

  useEffect(() => {
    // LocalStorage에서 기존 리뷰 불러오기
    const savedReviews = localStorage.getItem('userReviews');
    if (savedReviews) {
      const userReviews = JSON.parse(savedReviews);
      setReviews([...userReviews, ...reviewsData]);
    } else {
      setReviews(reviewsData);
    }
  }, []);

  const handleSubmitReview = () => {
    if (!newReview.name.trim() || !newReview.content.trim()) {
      alert('이름과 내용을 입력해주세요!');
      return;
    }

    const review = {
      id: Date.now(),
      name: newReview.name,
      rating: newReview.rating,
      content: newReview.content,
      date: new Date().toISOString().split('T')[0]
    };

    // LocalStorage에 저장
    const savedReviews = localStorage.getItem('userReviews');
    const userReviews = savedReviews ? JSON.parse(savedReviews) : [];
    userReviews.unshift(review);
    localStorage.setItem('userReviews', JSON.stringify(userReviews));

    // 화면 업데이트
    setReviews([review, ...reviews]);
    setNewReview({ name: '', rating: 5, content: '' });
    setShowWriteForm(false);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}>
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const renderStarSelector = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setNewReview({ ...newReview, rating: star })}
            className={`text-3xl ${star <= newReview.rating ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === parseInt(filter));

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card bg-base-100 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="card-body">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title text-3xl">📝 사용자 후기</h2>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* 평균 평점 */}
          <div className="stats shadow mb-6">
            <div className="stat">
              <div className="stat-title">전체 평균 평점</div>
              <div className="stat-value text-primary">{averageRating}</div>
              <div className="stat-desc">{renderStars(Math.round(averageRating))}</div>
            </div>
            <div className="stat">
              <div className="stat-title">총 후기 수</div>
              <div className="stat-value text-secondary">{reviews.length}</div>
              <div className="stat-desc">개의 후기</div>
            </div>
          </div>

          {/* 평점 분포 */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">평점 분포</h3>
            {ratingCounts.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-2 mb-1">
                <span className="w-16">{rating}점</span>
                <progress
                  className="progress progress-warning w-full"
                  value={count}
                  max={reviews.length}
                ></progress>
                <span className="w-12 text-right">{count}개</span>
              </div>
            ))}
          </div>

          {/* 후기 작성 버튼 */}
          {!showWriteForm && (
            <button
              className="btn btn-primary mb-4"
              onClick={() => setShowWriteForm(true)}
            >
              ✍️ 후기 작성하기
            </button>
          )}

          {/* 후기 작성 폼 */}
          {showWriteForm && (
            <div className="card bg-base-200 p-4 mb-6">
              <h3 className="font-bold text-xl mb-4">새 후기 작성</h3>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">이름</span>
                </label>
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  className="input input-bordered"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">평가 점수</span>
                </label>
                {renderStarSelector()}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">후기 내용</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="CodingNiao를 사용한 후기를 작성해주세요!"
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                ></textarea>
              </div>

              <div className="flex gap-2">
                <button className="btn btn-primary flex-1" onClick={handleSubmitReview}>
                  후기 등록
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowWriteForm(false)}
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 필터 */}
          <div className="tabs tabs-boxed mb-4">
            <a
              className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              전체
            </a>
            {[5, 4, 3, 2, 1].map(rating => (
              <a
                key={rating}
                className={`tab ${filter === rating.toString() ? 'tab-active' : ''}`}
                onClick={() => setFilter(rating.toString())}
              >
                {rating}점
              </a>
            ))}
          </div>

          {/* 후기 목록 */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                해당 평점의 후기가 없습니다.
              </div>
            ) : (
              filteredReviews.map(review => (
                <div key={review.id} className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{review.name}</h3>
                        <div className="flex gap-2 items-center">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2">{review.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSystem;
