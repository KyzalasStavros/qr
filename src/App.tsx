import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Moon, Sun, QrCode } from 'lucide-react';
import { HomePage } from './pages/HomePage';
import { RedirectPage } from './pages/RedirectPage';
import { ErrorPage } from './pages/ErrorPage';

const THEME_KEY = 'qr-theme';

type Theme = 'light' | 'dark' | 'system';

function getInitialTheme(): Theme {
  return (localStorage.getItem(THEME_KEY) as Theme) || 'system';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

function Navbar({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  function toggle() {
    // Cycle: system → light → dark → system
    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
  }

  const icon =
    theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'light' ? <Sun className="w-4 h-4" /> : <span className="text-xs font-bold">A</span>;

  const label = `Theme: ${theme}. Click to cycle.`;

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href={import.meta.env.BASE_URL} className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
          <QrCode className="w-5 h-5 text-indigo-600" />
          QR Generator
        </a>
        <button
          onClick={toggle}
          aria-label={label}
          title={label}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {icon}
        </button>
      </div>
    </header>
  );
}

export default function App() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  function setTheme(t: Theme) {
    localStorage.setItem(THEME_KEY, t);
    setThemeState(t);
    applyTheme(t);
  }

  useEffect(() => {
    applyTheme(theme);
    // Also listen to system pref changes when in 'system' mode
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (theme === 'system') applyTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Navbar theme={theme} setTheme={setTheme} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/go/:slug" element={<RedirectPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
