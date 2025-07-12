import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Eye, MessageCircle, ArrowUp, ArrowDown, Check } from 'lucide-react';

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

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Stats */}
        <div className="flex flex-col items-center space-y-2 text-sm text-gray-600 min-w-[80px]">
          <div className="flex items-center space-x-1">
            <ArrowUp className="h-4 w-4" />
            <span className="font-medium">{question.voteScore}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{question.answerCount}</span>
            {question.acceptedAnswer && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{question.views}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
            <Link to={`/questions/${question._id}`}>
              {question.title}
            </Link>
          </h3>
          
          <div className="text-gray-600 mb-3 line-clamp-2">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: question.description.substring(0, 200) + '...' 
              }} 
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Author and Date */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {question.author.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium">{question.author.username}</span>
              <span>•</span>
              <span>{question.author.reputation} rep</span>
            </div>
            <span>
              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;