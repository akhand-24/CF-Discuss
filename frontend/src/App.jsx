import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import AskQuestion from './pages/AskQuestion';
import QuestionDetail from './pages/QuestionDetail';
import Contests from './pages/Contests';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/ask" element={<AskQuestion />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />
            <Route path="/contests" element={<Contests />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
