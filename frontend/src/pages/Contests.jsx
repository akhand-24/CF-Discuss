import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPhase, setFilterPhase] = useState('ALL');
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      try {
        const response = await api.get('/contests');
        setContests(response.data);
      } catch (err) {
        console.error('Error fetching contests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const filteredContests = contests.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesPhase =
      filterPhase === 'ALL' ||
      (filterPhase === 'FINISHED' && c.phase === 'FINISHED') ||
      (filterPhase === 'ACTIVE' && (c.phase === 'CODING' || c.phase === 'BEFORE'));
    return matchesSearch && matchesPhase;
  });

  const viewDiscussions = (contestId, contestName) => {
    navigate(`/?contestId=${contestId}&contestName=${encodeURIComponent(contestName)}`);
  };

  const askAboutContest = (contestId, contestName) => {
    navigate(`/ask?contestId=${contestId}&contestName=${encodeURIComponent(contestName)}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Codeforces Contests</h1>
          <p className="mt-1 text-slate-500">Find discussions or ask questions specific to active or completed contests</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter contests by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm shadow-sm"
        />

        <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setFilterPhase('ALL')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${filterPhase === 'ALL' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
          >
            All Contests
          </button>
          <button
            onClick={() => setFilterPhase('FINISHED')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${filterPhase === 'FINISHED' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Finished
          </button>
          <button
            onClick={() => setFilterPhase('ACTIVE')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${filterPhase === 'ACTIVE' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Upcoming / Live
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-lg shadow-sm">
          <p className="text-slate-500">No contests found matching your filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Contest Name</th>
                  <th className="px-6 py-4">Phase</th>
                  <th className="px-6 py-4">Start Time</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredContests.slice(0, 100).map((contest) => (
                  <tr key={contest.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-600">{contest.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 break-words max-w-sm">
                      {contest.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${contest.phase === 'FINISHED' ? 'bg-slate-100 text-slate-700' : contest.phase === 'CODING' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {contest.phase === 'FINISHED' ? 'Finished' : contest.phase === 'CODING' ? 'Running' : 'Upcoming'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                      {new Date(contest.startTimeSeconds * 1000).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-3">
                      <button
                        onClick={() => viewDiscussions(contest.id, contest.name)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline focus:outline-none"
                      >
                        View discussions
                      </button>
                      {user && (
                        <button
                          onClick={() => askAboutContest(contest.id, contest.name)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded shadow transition-colors"
                        >
                          Ask Question
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredContests.length > 100 && (
            <div className="px-6 py-3 border-t border-slate-200 text-center text-xs text-slate-400 font-medium bg-slate-50">
              Showing first 100 contests. Use search filter to narrow down results.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Contests;
