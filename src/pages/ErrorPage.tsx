import { useNavigate } from 'react-router-dom';

export function ErrorPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 bg-gray-50 dark:bg-gray-950">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="text-gray-500 dark:text-gray-400">Page not found.</p>
      <button
        onClick={() => navigate('/')}
        className="mt-4 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
      >
        Go to QR Generator
      </button>
    </div>
  );
}
