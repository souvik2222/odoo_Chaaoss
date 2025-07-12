import React from 'react';
import QuestionCard from './QuestionCard';
import Pagination from '../Common/Pagination';

interface Question {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  author: {
    username: string;
    avatar: string;
    reputation: number;
  };
  views: number;
  voteScore: number;
  answerCount: number;
  acceptedAnswer?: any;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalQuestions: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface QuestionListProps {
  questions: Question[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  pagination,
  onPageChange,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-20 space-y-2">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No questions found</div>
        <p className="text-gray-400 mt-2">Be the first to ask a question!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {questions.map((question) => (
          <QuestionCard key={question._id} question={question} />
        ))}
      </div>
      
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
        />
      )}
    </div>
  );
};

export default QuestionList;