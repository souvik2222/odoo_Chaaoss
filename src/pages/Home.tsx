import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Plus, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import QuestionList from '../components/Questions/QuestionList';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [pagination.currentPage, sortBy, searchTerm]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/questions', {
        params: {
          page: pagination.currentPage,
          sort: sortBy,
          search: searchTerm,
          limit: 10
        }
      });
      setQuestions(response.data.questions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Questions
          </h1>
          <p className="text-gray-600">
            {pagination.totalQuestions} questions
          </p>
        </div>
        {user && (
          <Link
            to="/ask"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Ask Question</span>
          </Link>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="votes">Most Votes</option>
              <option value="views">Most Views</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question List */}
      <QuestionList
        questions={questions}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />

      {/* Getting Started Section for New Users */}
      {!user && (
        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Join the StackIt Community
          </h2>
          <p className="text-gray-600 mb-6">
            Ask questions, share knowledge, and learn from others in our collaborative Q&A platform.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              to="/login"
              className="bg-white hover:bg-gray-50 text-blue-600 px-6 py-3 rounded-lg font-medium border border-blue-600 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;