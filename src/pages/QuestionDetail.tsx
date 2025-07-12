import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  Eye, 
  Check, 
  Pin,
  Trash2,
  Edit
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/Editor/RichTextEditor';
import Breadcrumb from '../components/Common/Breadcrumb';

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});
  const [showCommentInput, setShowCommentInput] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await api.get(`/questions/${id}`);
      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Question not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type: 'upvote' | 'downvote', isQuestion = true, targetId?: string) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    try {
      const url = isQuestion ? `/questions/${id}/vote` : `/answers/${targetId}/vote`;
      await api.post(url, { type });
      await fetchQuestion();
      toast.success('Vote recorded');
    } catch (error) {
      toast.error('Error recording vote');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to answer');
      return;
    }

    if (!answerContent.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    setSubmittingAnswer(true);
    try {
      await api.post('/answers', {
        content: answerContent,
        questionId: id
      });
      setAnswerContent('');
      await fetchQuestion();
      toast.success('Answer posted successfully');
    } catch (error) {
      toast.error('Error posting answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      await api.post(`/answers/${answerId}/accept`);
      await fetchQuestion();
      toast.success('Answer accepted');
    } catch (error) {
      toast.error('Error accepting answer');
    }
  };

  const handlePinAnswer = async (answerId: string) => {
    try {
      await api.post(`/answers/${answerId}/pin`);
      await fetchQuestion();
      toast.success('Pinned accepted answer');
    } catch (error) {
      toast.error('Error pinning answer');
    }
  };

  const handleDeleteQuestion = async () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await api.delete(`/questions/${id}`);
        toast.success('Question deleted');
        navigate('/');
      } catch (error) {
        toast.error('Error deleting question');
      }
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      try {
        await api.delete(`/answers/${answerId}`);
        await fetchQuestion();
        toast.success('Answer deleted');
      } catch (error) {
        toast.error('Error deleting answer');
      }
    }
  };

  const handleAddComment = async (answerId: string) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    const content = commentContent[answerId];
    if (!content?.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await api.post('/comments', {
        content: content.trim(),
        answerId
      });
      setCommentContent(prev => ({ ...prev, [answerId]: '' }));
      setShowCommentInput(prev => ({ ...prev, [answerId]: false }));
      await fetchQuestion();
      toast.success('Comment added');
    } catch (error) {
      toast.error('Error adding comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.delete(`/comments/${commentId}`);
        await fetchQuestion();
        toast.success('Comment deleted');
      } catch (error) {
        toast.error('Error deleting comment');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return <div>Question not found</div>;
  }

  const questionVoteScore = question.votes.filter((v: any) => v.type === 'upvote').length - 
                           question.votes.filter((v: any) => v.type === 'downvote').length;

  const isQuestionOwner = user && question.author._id === user._id;

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Questions', href: '/' },
    { label: question.title.length > 50 ? question.title.substring(0, 50) + '...' : question.title }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Question */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex gap-6">
            {/* Vote Section */}
            <div className="flex flex-col items-center space-y-2 min-w-[60px]">
              <button
                onClick={() => handleVote('upvote', true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={!user}
              >
                <ArrowUp className="h-6 w-6 text-gray-600" />
              </button>
              <span className="text-xl font-bold text-gray-900">{questionVoteScore}</span>
              <button
                onClick={() => handleVote('downvote', true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={!user}
              >
                <ArrowDown className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
                {isQuestionOwner && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDeleteQuestion}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div 
                className="prose max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: question.description }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Question Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{question.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{question.answers.length} answers</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {question.author.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{question.author.username}</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
        </h2>

        {question.answers.map((answer: any) => {
          const answerVoteScore = answer.votes.filter((v: any) => v.type === 'upvote').length - 
                                 answer.votes.filter((v: any) => v.type === 'downvote').length;
          const isAnswerOwner = user && answer.author._id === user._id;
          const canManageAnswer = isQuestionOwner || isAnswerOwner;

          return (
            <div key={answer._id} className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                    <button
                      onClick={() => handleVote('upvote', false, answer._id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      disabled={!user}
                    >
                      <ArrowUp className="h-6 w-6 text-gray-600" />
                    </button>
                    <span className="text-xl font-bold text-gray-900">{answerVoteScore}</span>
                    <button
                      onClick={() => handleVote('downvote', false, answer._id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      disabled={!user}
                    >
                      <ArrowDown className="h-6 w-6 text-gray-600" />
                    </button>
                    
                    {answer.isAccepted && (
                      <div className="p-2">
                        <Check className="h-6 w-6 text-green-500" />
                      </div>
                    )}
                    
                    {answer.isPinned && (
                      <div className="p-2">
                        <Pin className="h-6 w-6 text-orange-500" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div 
                      className="prose max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: answer.content }}
                    />

                    {/* Answer Actions */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex space-x-4">
                        {isQuestionOwner && !answer.isAccepted && (
                          <button
                            onClick={() => handleAcceptAnswer(answer._id)}
                            
                          >
                            Accept Answer
                          </button>
                        )}
                        {isQuestionOwner && !answer.isPinned && (
                          <button
                            onClick={() => handlePinAnswer(answer._id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                          >
                            Accepted Answer
                          </button>
                        )}
                        <button
                          onClick={() => setShowCommentInput(prev => ({ 
                            ...prev, 
                            [answer._id]: !prev[answer._id] 
                          }))}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                          Add Comment
                        </button>
                        {canManageAnswer && (
                          <button
                            onClick={() => handleDeleteAnswer(answer._id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {answer.author.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{answer.author.username}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Comment Input */}
                    {showCommentInput[answer._id] && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <textarea
                          value={commentContent[answer._id] || ''}
                          onChange={(e) => setCommentContent(prev => ({
                            ...prev,
                            [answer._id]: e.target.value
                          }))}
                          placeholder="Add a comment..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          maxLength={500}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-500">
                            {(commentContent[answer._id] || '').length}/500
                          </span>
                          <div className="space-x-2">
                            <button
                              onClick={() => setShowCommentInput(prev => ({ 
                                ...prev, 
                                [answer._id]: false 
                              }))}
                              className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddComment(answer._id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Comment
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comments */}
                    {answer.comments.length > 0 && (
                      <div className="space-y-3">
                        {answer.comments.map((comment: any) => (
                          <div key={comment._id} className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-800 mb-2">{comment.content}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">
                                    {comment.author.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span>{comment.author.username}</span>
                                <span>•</span>
                                <span>
                                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              {(user && (comment.author._id === user._id || isQuestionOwner)) && (
                                <button
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Answer Form */}
      {user && (
        <div className="mt-8 bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
            <form onSubmit={handleSubmitAnswer}>
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
              />
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={submittingAnswer || !answerContent.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingAnswer ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!user && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">Want to answer this question?</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDetail;
