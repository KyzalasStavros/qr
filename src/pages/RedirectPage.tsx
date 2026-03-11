import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRedirects, resolveSlug } from '../utils/redirects';

type Status = 'loading' | 'redirecting' | 'not-found' | 'error';

export function RedirectPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [destination, setDestination] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const map = await fetchRedirects();
      if (cancelled) return;

      if (map === null) {
        setStatus('error');
        return;
      }

      const dest = resolveSlug(map, slug);
      if (!dest) {
        setStatus('not-found');
        return;
      }

      setDestination(dest);
      setStatus('redirecting');
      // Small delay so the user can read the "Redirecting…" message
      setTimeout(() => {
        if (!cancelled) window.location.replace(dest);
      }, 800);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (status === 'loading') {
    return (
      <Centered>
        <Spinner />
        <p className="text-gray-500 dark:text-gray-400 mt-4">Looking up redirect…</p>
      </Centered>
    );
  }

  if (status === 'redirecting') {
    return (
      <Centered>
        <Spinner />
        <p className="text-gray-700 dark:text-gray-300 mt-4 font-medium">Redirecting…</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 break-all max-w-sm text-center">
          {destination}
        </p>
      </Centered>
    );
  }

  if (status === 'not-found') {
    return (
      <Centered>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Link not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          The slug <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{slug}</code> doesn't exist in this site's redirects.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
          If you control this site, add the slug to <code className="font-mono">public/data/redirects.json</code> and redeploy.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          Go to QR Generator
        </button>
      </Centered>
    );
  }

  // error (failed to fetch)
  return (
    <Centered>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        Could not load the redirect map. Check that <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">data/redirects.json</code> exists in the deployed site.
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-6 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
      >
        Go to QR Generator
      </button>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 px-4 bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
  );
}
