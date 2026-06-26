import { useEffect, useMemo } from 'react';

export function useZoom(zoomLevel: number, setZoomLevel: (level: number) => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoomLevel(Math.min(zoomLevel + 0.1, 2.5));
        } else if (e.key === '-') {
          e.preventDefault();
          setZoomLevel(Math.max(zoomLevel - 0.1, 0.5));
        } else if (e.key === '0') {
          e.preventDefault();
          setZoomLevel(1.0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomLevel, setZoomLevel]);

  const zoomStyle = useMemo(() => ({ fontSize: `${zoomLevel}rem` }), [zoomLevel]);
  
  return { zoomStyle };
}
