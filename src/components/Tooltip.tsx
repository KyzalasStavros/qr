import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Props {
  content: React.ReactNode;
  /** Where the tooltip appears. Default 'top'. */
  position?: 'top' | 'bottom' | 'right';
}

/**
 * Accessible tooltip — shown on hover and on focus.
 * Renders via portal so it's never clipped by scrolling parents.
 */
export function Tooltip({ content, position = 'top' }: Props) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  function show() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;
    const GAP = 8;
    if (position === 'top') {
      top = r.top - GAP;
      left = r.left + r.width / 2;
    } else if (position === 'bottom') {
      top = r.bottom + GAP;
      left = r.left + r.width / 2;
    } else {
      top = r.top + r.height / 2;
      left = r.right + GAP;
    }
    setCoords({ top, left });
    setVisible(true);
  }

  function hide() {
    setVisible(false);
  }

  // Close on Escape
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') hide(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible]);

  const positionStyle: React.CSSProperties =
    position === 'top'
      ? { bottom: `calc(100vh - ${coords.top}px)`, left: coords.left, transform: 'translateX(-50%)' }
      : position === 'bottom'
      ? { top: coords.top, left: coords.left, transform: 'translateX(-50%)' }
      : { top: coords.top, left: coords.left, transform: 'translateY(-50%)' };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="More information"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full shrink-0"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {visible &&
        createPortal(
          <div
            role="tooltip"
            style={positionStyle}
            className="fixed z-50 max-w-xs rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 shadow-lg pointer-events-none"
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
