import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Feed = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('votes');
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useContext(AuthContext);

  const contestId = searchParams.get('contestId');
  const contestName = searchParams.get('contestName');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (contestId) params.contestId = contestId;
      if (search) params.search = search;
      params.sortBy = sortBy === 'newest' ? 'newest' : 'votes';

      const response = await api.get('/questions', { params });
      setQuestions(response.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [contestId, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleVote = async (id, type) => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }

    try {
      const response = await api.post(`/questions/${id}/${type}`);
      const { score, upvotes, downvotes } = response.data;
      
      setQuestions(prevQuestions =>
        prevQuestions.map(q => {
          if (q._id === id) {
            return { ...q, score, upvotes, downvotes };
          }
          return q;
        })
      );
    } catch (err) {
      console.error(`Error during ${type}:`, err);
    }
  };

  const clearContestFilter = () => {
    searchParams.delete('contestId');
    searchParams.delete('contestName');
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Codeforces Discussions</h1>
          <p className="mt-1 text-slate-500">Ask questions, share solutions, and discuss Codeforces contests</p>
        </div>
        {user && (
          <Link
            to="/ask"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow transition-colors duration-200"
          >
            Ask a Question
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-grow px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm shadow-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm rounded-md shadow transition-colors"
            >
              Search
            </button>
          </form>

          {contestName && (
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm font-medium">
              <span>Showing discussions for: <strong className="font-semibold">{contestName}</strong></span>
              <button
                onClick={clearContestFilter}
                className="text-xs text-red-600 hover:text-red-800 underline font-semibold focus:outline-none"
              >
                Clear Filter
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-lg shadow-sm">
              <p className="text-slate-500 text-base">No discussions found. Be the first to start one!</p>
              {user && (
                <Link
                  to={contestId ? `/ask?contestId=${contestId}&contestName=${encodeURIComponent(contestName)}` : '/ask'}
                  className="mt-4 inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Post a question &rarr;
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => {
                const hasUpvoted = user && question.upvotes.includes(user._id);
                const hasDownvoted = user && question.downvotes.includes(user._id);

                return (
                  <div key={question._id} className="flex gap-4 p-5 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-all duration-200">
                    <div className="flex flex-col items-center justify-start space-y-1">
                      <button
                        onClick={() => handleVote(question._id, 'upvote')}
                        className={`p-1.5 rounded hover:bg-slate-100 transition-colors focus:outline-none ${hasUpvoted ? 'text-green-600' : 'text-slate-400'}`}
                        title="Upvote"
                      >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M4 14h6v8h4v-8h6L12 4 4 14z" />
                        </svg>
                      </button>
                      <span className={`text-sm font-bold font-mono ${question.score > 0 ? 'text-green-600' : question.score < 0 ? 'text-red-500' : 'text-slate-600'}`}>
                        {question.score}
                      </span>
                      <button
                        onClick={() => handleVote(question._id, 'downvote')}
                        className={`p-1.5 rounded hover:bg-slate-100 transition-colors focus:outline-none ${hasDownvoted ? 'text-red-500' : 'text-slate-400'}`}
                        title="Downvote"
                      >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M20 10h-6V2h-4v8H4l8 10 8-10z" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                        <span>Posted by {question.author?.username}</span>
                        <a
                          href={`https://codeforces.com/profile/${question.author?.cfHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-red-500 hover:underline"
                        >
                          @{question.author?.cfHandle}
                        </a>
                        <span>&bull;</span>
                        <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 hover:text-red-600 break-words mb-2">
                        <Link to={`/questions/${question._id}`}>
                          {question.title}
                        </Link>
                      </h2>

                      <p className="text-slate-600 text-sm line-clamp-2 break-words mb-3">
                        {question.body}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {question.contestName && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-medium">
                              {question.contestName}
                            </span>
                          )}
                          {question.code && (
                            <span className="px-2 py-0.5 bg-zinc-900 text-zinc-300 font-mono rounded border border-zinc-800 text-[10px]">
                              Code Attached
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/questions/${question._id}`}
                          className="text-red-600 hover:text-red-700 font-semibold transition-colors"
                        >
                          Discuss &amp; Answer &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">Sort Discussions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSortBy('votes')}
                className={`w-full text-left px-3 py-1.5 rounded text-sm font-medium transition-colors ${sortBy === 'votes' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Highest Upvoted
              </button>
              <button
                onClick={() => setSortBy('newest')}
                className={`w-full text-left px-3 py-1.5 rounded text-sm font-medium transition-colors ${sortBy === 'newest' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Newest Posts
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 text-xs text-slate-500">
            <h4 className="font-semibold text-slate-700 mb-2">Discuss Guidelines</h4>
            <p className="leading-relaxed">Keep debates healthy and respect the community code of conduct. Focus code snippets on clean logic and include comments in plain text rather than code files.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
