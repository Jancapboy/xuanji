import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChartPage from './pages/ChartPage';
import KnowledgePage from './pages/KnowledgePage';
import ChatPage from './pages/ChatPage';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/', label: '排盘', icon: '◈' },
    { path: '/chart', label: '命盘', icon: '☯' },
    { path: '/knowledge', label: '知识', icon: '◉' },
    { path: '/chat', label: '解读', icon: '◐' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 z-50">
      <div className="max-w-lg mx-auto flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-0.5 text-xs ${
              location.pathname === tab.path
                ? 'text-cinnabar'
                : 'text-gray-400'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'chart' | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setCurrentView('chart');
        navigate('/chart');
      }
    };
    window.addEventListener('navigate-to-chart', handler);
    return () => window.removeEventListener('navigate-to-chart', handler);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-paper pb-16">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
