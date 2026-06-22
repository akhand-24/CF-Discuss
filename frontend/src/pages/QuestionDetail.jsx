import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CodeBlock from '../components/CodeBlock';
import api from '../services/api';

const QuestionDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [questionComment, setQuestionComment] = useState('');
  const [showQuestionCommentForm, setShowQuestionCommentForm] = useState(false);

  const [answerBody, setAnswerBody] = useState('');
  const [answerCode, setAnswerCode] = useState('');
  const [answerLanguage, setAnswerLanguage] = useState('cpp');
  const [answerSubmitting, setAnswerSubmitting] = useState(false);

  const [activeAnswerCommentId, setActiveAnswerCommentId] = useState(null);
  const [answerCommentText, setAnswerCommentText] = useState('');

  const fetchQuestionAndAnswers = async () => {
    setLoading(true);
    try {
      const qRes = await api.get(`/questions/${id}`);
      setQuestion(qRes.data);

      const aRes = await api.get(`/answers/question/${id}`);
      setAnswers(aRes.data);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [id]);

  const handleQuestionVote = async (type) => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }
    try {
      const res = await api.post(`/questions/${id}/${type}`);
      setQuestion((prev) => ({
        ...prev,
        score: res.data.score,
        upvotes: res.data.upvotes,
        downvotes: res.data.downvotes,
      }));
    } catch (err) {
      console.error('Error voting on question:', err);
    }
  };

  const handleAnswerVote = async (answerId, type) => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }
    try {
      const res = await api.post(`/answers/${answerId}/${type}`);
      setAnswers((prev) =>
        prev.map((ans) =>
          ans._id === answerId
            ? { ...ans, score: res.data.score, upvotes: res.data.upvotes, downvotes: res.data.downvotes }
            : ans
        )
      );
    } catch (err) {
      console.error('Error voting on answer:', err);
    }
  };

  const handleQuestionCommentSubmit = async (e) => {
    e.preventDefault();
    if (!questionComment.trim()) return;

    try {
      const res = await api.post(`/questions/${id}/comments`, { text: questionComment });
      setQuestion((prev) => ({
        ...prev,
        comments: [...prev.comments, res.data],
      }));
      setQuestionComment('');
      setShowQuestionCommentForm(false);
    } catch (err) {
      console.error('Error posting question comment:', err);
    }
  };

  const handleAnswerCommentSubmit = async (e, answerId) => {
    e.preventDefault();
    if (!answerCommentText.trim()) return;

    try {
      const res = await api.post(`/answers/${answerId}/comments`, { text: answerCommentText });
      setAnswers((prev) =>
        prev.map((ans) =>
          ans._id === answerId ? { ...ans, comments: [...ans.comments, res.data] } : ans
        )
      );
      setAnswerCommentText('');
      setActiveAnswerCommentId(null);
    } catch (err) {
      console.error('Error posting answer comment:', err);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerBody.trim()) {
      alert('Please provide some solution text.');
      return;
    }

    setAnswerSubmitting(true);
    try {
      const res = await api.post('/answers', {
        questionId: id,
        body: answerBody,
        code: answerCode,
        codeLanguage: answerLanguage,
      });
      setAnswers((prev) => [...prev, res.data]);
      setAnswerBody('');
      setAnswerCode('');
    } catch (err) {
      console.error('Error posting answer:', err);
    } finally {
      setAnswerSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Question not found</h2>
        <Link to="/" className="text-red-600 hover:underline mt-2 inline-block">
          Go back to discussions
        </Link>
      </div>
    );
  }

  const userHasUpvotedQ = user && question.upvotes.includes(user._id);
  const userHasDownvotedQ = user && question.downvotes.includes(user._id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-4 pb-6 border-b border-slate-200">
        <div className="flex flex-col items-center pt-2">
          <button
            onClick={() => handleQuestionVote('upvote')}
            className={`p-1.5 rounded hover:bg-slate-100 transition-colors focus:outline-none ${userHasUpvotedQ ? 'text-green-600' : 'text-slate-400'}`}
          >
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M4 14h6v8h4v-8h6L12 4 4 14z" />
            </svg>
          </button>
          <span className={`text-base font-bold font-mono my-1 ${question.score > 0 ? 'text-green-600' : question.score < 0 ? 'text-red-500' : 'text-slate-600'}`}>
            {question.score}
          </span>
          <button
            onClick={() => handleQuestionVote('downvote')}
            className={`p-1.5 rounded hover:bg-slate-100 transition-colors focus:outline-none ${userHasDownvotedQ ? 'text-red-500' : 'text-slate-400'}`}
          >
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M20 10h-6V2h-4v8H4l8 10 8-10z" />
            </svg>
          </button>
        </div>

        <div className="flex-grow min-w-0">
          {question.contestName && (
            <span className="inline-block px-2.5 py-0.5 mb-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-200">
              {question.contestName}
            </span>
          )}

          <h1 className="text-2xl font-bold text-slate-900 break-words mb-2">
            {question.title}
          </h1>

          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-4">
            <span>Posted by <strong className="text-slate-700">{question.author?.username}</strong></span>
            <a
              href={`https://codeforces.com/profile/${question.author?.cfHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-red-500 hover:underline"
            >
              @{question.author?.cfHandle}
            </a>
            <span>&bull;</span>
            <span>{new Date(question.createdAt).toLocaleString()}</span>
          </div>

          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap break-words mb-6">
            {question.body}
          </div>

          {question.code && (
            <CodeBlock code={question.code} language={question.codeLanguage} />
          )}

          <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Comments ({question.comments.length})</h3>
            <div className="space-y-3 mb-4">
              {question.comments.map((comment) => (
                <div key={comment._id} className="text-xs p-3 bg-slate-50 border border-slate-100 rounded-md">
                  <div className="flex items-center space-x-2 text-slate-500 mb-1">
                    <span className="font-semibold text-slate-700">{comment.authorUsername}</span>
                    <a
                      href={`https://codeforces.com/profile/${comment.authorCfHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-red-500 hover:underline"
                    >
                      @{comment.authorCfHandle}
                    </a>
                    <span>&bull;</span>
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 break-words font-sans">{comment.text}</p>
                </div>
              ))}
            </div>

            {user ? (
              <div>
                {!showQuestionCommentForm ? (
                  <button
                    onClick={() => setShowQuestionCommentForm(true)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 underline focus:outline-none"
                  >
                    Add a comment
                  </button>
                ) : (
                  <form onSubmit={handleQuestionCommentSubmit} className="flex flex-col gap-2 max-w-lg mt-2">
                    <textarea
                      rows={2}
                      value={questionComment}
                      onChange={(e) => setQuestionComment(e.target.value)}
                      placeholder="Type your comment..."
                      className="w-full p-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-3 py-1 bg-red-600 text-white font-semibold text-xs rounded hover:bg-red-700 shadow"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowQuestionCommentForm(false)}
                        className="px-3 py-1 border border-slate-300 text-slate-700 text-xs rounded hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Please{' '}
                <Link to="/login" className="text-red-600 underline">
                  login
                </Link>{' '}
                to comment.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6">
          Solutions &amp; Answers ({answers.length})
        </h2>

        {answers.length === 0 ? (
          <p className="text-slate-500 text-sm py-4">No answers posted yet. Have a solution? Share it below!</p>
        ) : (
          <div className="space-y-8">
            {answers.map((answer) => {
              const hasUpvotedAns = user && answer.upvotes.includes(user._id);
              const hasDownvotedAns = user && answer.downvotes.includes(user._id);

              return (
                <div key={answer._id} className="flex gap-4 p-5 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex flex-col items-center pt-1">
                    <button
                      onClick={() => handleAnswerVote(answer._id, 'upvote')}
                      className={`p-1 rounded hover:bg-slate-100 transition-colors focus:outline-none ${hasUpvotedAns ? 'text-green-600' : 'text-slate-400'}`}
                    >
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M4 14h6v8h4v-8h6L12 4 4 14z" />
                      </svg>
                    </button>
                    <span className={`text-xs font-bold font-mono my-0.5 ${answer.score > 0 ? 'text-green-600' : answer.score < 0 ? 'text-red-500' : 'text-slate-600'}`}>
                      {answer.score}
                    </span>
                    <button
                      onClick={() => handleAnswerVote(answer._id, 'downvote')}
                      className={`p-1 rounded hover:bg-slate-100 transition-colors focus:outline-none ${hasDownvotedAns ? 'text-red-500' : 'text-slate-400'}`}
                    >
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M20 10h-6V2h-4v8H4l8 10 8-10z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
                      <span>Answered by <strong className="text-slate-700">{answer.author?.username}</strong></span>
                      <a
                        href={`https://codeforces.com/profile/${answer.author?.cfHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-red-500 hover:underline"
                      >
                        @{answer.author?.cfHandle}
                      </a>
                      <span>&bull;</span>
                      <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap break-words mb-4">
                      {answer.body}
                    </div>

                    {answer.code && (
                      <CodeBlock code={answer.code} language={answer.codeLanguage} />
                    )}

                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Comments ({answer.comments?.length || 0})</h4>
                      <div className="space-y-2 mb-2">
                        {answer.comments?.map((comment) => (
                          <div key={comment._id} className="text-[11px] p-2 bg-slate-50 border border-slate-100 rounded-md">
                            <div className="flex items-center space-x-2 text-slate-500 mb-1">
                              <span className="font-semibold text-slate-700">{comment.authorUsername}</span>
                              <a
                                href={`https://codeforces.com/profile/${comment.authorCfHandle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-red-500 hover:underline"
                              >
                                @{comment.authorCfHandle}
                              </a>
                              <span>&bull;</span>
                              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-600 break-words">{comment.text}</p>
                          </div>
                        ))}
                      </div>

                      {user ? (
                        <div>
                          {activeAnswerCommentId !== answer._id ? (
                            <button
                              onClick={() => {
                                setActiveAnswerCommentId(answer._id);
                                setAnswerCommentText('');
                              }}
                              className="text-[10px] font-semibold text-red-600 hover:text-red-700 underline focus:outline-none"
                            >
                              Add a comment
                            </button>
                          ) : (
                            <form onSubmit={(e) => handleAnswerCommentSubmit(e, answer._id)} className="flex flex-col gap-1.5 max-w-lg mt-1">
                              <textarea
                                rows={1.5}
                                value={answerCommentText}
                                onChange={(e) => setAnswerCommentText(e.target.value)}
                                placeholder="Type your comment..."
                                className="w-full p-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                                required
                              />
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  className="px-2 py-0.5 bg-red-600 text-white font-semibold text-[10px] rounded hover:bg-red-700 shadow"
                                >
                                  Submit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveAnswerCommentId(null)}
                                  className="px-2 py-0.5 border border-slate-300 text-slate-700 text-[10px] rounded hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400">Please login to comment.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-12 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Your Solution</h3>
        {user ? (
          <form onSubmit={handleAnswerSubmit} className="space-y-4">
            <div>
              <label htmlFor="ans-body" className="block text-sm font-semibold text-slate-700 mb-1">
                Solution Details
              </label>
              <textarea
                id="ans-body"
                rows={5}
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                placeholder="Explain your approach, optimization details, or feedback..."
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="ans-code" className="block text-sm font-semibold text-slate-700">
                  Solution Code (Optional)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Language:</span>
                  <select
                    value={answerLanguage}
                    onChange={(e) => setAnswerLanguage(e.target.value)}
                    className="px-2 py-0.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-red-500 focus:border-red-500"
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
                id="ans-code"
                rows={6}
                value={answerCode}
                onChange={(e) => setAnswerCode(e.target.value)}
                placeholder="// Paste code snippet here..."
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm font-mono text-sm placeholder-slate-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={answerSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
              >
                {answerSubmitting ? 'Posting Solution...' : 'Post Solution'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-500">
            Please{' '}
            <Link to="/login" className="text-red-600 underline font-semibold">
              login
            </Link>{' '}
            to post a solution.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
