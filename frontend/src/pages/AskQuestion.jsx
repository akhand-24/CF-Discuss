import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [code, setCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const [contests, setContests] = useState([]);
  const [selectedContestId, setSelectedContestId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const contestIdFromParam = searchParams.get('contestId');
  const contestNameFromParam = searchParams.get('contestName');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchContests = async () => {
      try {
        const response = await api.get('/contests');
        setContests(response.data);
      } catch (err) {
        console.error('Failed to fetch contests', err);
      }
    };

    fetchContests();
  }, [user, navigate]);

  useEffect(() => {
    if (contestIdFromParam) {
      setSelectedContestId(contestIdFromParam);
    }
  }, [contestIdFromParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    let contestName = null;
    if (selectedContestId) {
      if (selectedContestId === contestIdFromParam && contestNameFromParam) {
        contestName = contestNameFromParam;
      } else {
        const contestObj = contests.find(c => c.id.toString() === selectedContestId.toString());
        if (contestObj) {
          contestName = contestObj.name;
        }
      }
    }

    try {
      const response = await api.post('/questions', {
        title,
        body,
        code,
        codeLanguage,
        contestId: selectedContestId ? Number(selectedContestId) : null,
        contestName
      });
      navigate(`/questions/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Post a Question</h1>
          <p className="mt-1 text-slate-500">Share your query or problem with the Codeforces community</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-700">
              Title
            </label>
            <p className="text-xs text-slate-400 mb-1">Be specific and descriptive about your issue</p>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Why does my DP solution TLE on Codeforces Round 853 Div2 Problem C?"
              className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="contest" className="block text-sm font-semibold text-slate-700">
              Link to Codeforces Contest (Optional)
            </label>
            <p className="text-xs text-slate-400 mb-1">Tie this discussion to a specific contest</p>
            {contestIdFromParam && contestNameFromParam ? (
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-sm font-medium">
                <span>{contestNameFromParam}</span>
                <button
                  type="button"
                  onClick={() => setSelectedContestId('')}
                  className="text-xs text-red-600 hover:text-red-800 underline font-semibold"
                >
                  Remove Link
                </button>
              </div>
            ) : (
              <select
                id="contest"
                value={selectedContestId}
                onChange={(e) => setSelectedContestId(e.target.value)}
                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="">-- Select a Contest --</option>
                {contests.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-semibold text-slate-700">
              Description
            </label>
            <p className="text-xs text-slate-400 mb-1">Describe the problem context, what you have tried, and where you are stuck</p>
            <textarea
              id="body"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Explain details of your question here..."
              className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              required
            />
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <label htmlFor="code" className="block text-sm font-semibold text-slate-700">
                  Code Snippet (Optional)
                </label>
                <p className="text-xs text-slate-400">Pasted code will render in a premium black box</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Language:</span>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="cpp">C++</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
            </div>
            <textarea
              id="code"
              rows={8}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here..."
              className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm font-mono text-sm placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex justify-end pt-4 space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestion;
