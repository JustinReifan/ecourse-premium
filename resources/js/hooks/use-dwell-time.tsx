
import { useEffect, useRef } from 'react';
import { useAnalytics } from './use-analytics';

export function useDwellTime(threshold = 15000) { // 15 seconds
    const { trackEngagement } = useAnalytics();
    const startTime = useRef(Date.now());
    const hasTracked = useRef(false);
    const isVisible = useRef(true);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                isVisible.current = false;
            } else {
                isVisible.current = true;
                startTime.current = Date.now();
            }
        };

        const checkDwellTime = () => {
            if (!hasTracked.current && isVisible.current) {
                const dwellTime = Date.now() - startTime.current;
                if (dwellTime >= threshold) {
                    hasTracked.current = true;
                    trackEngagement('dwell_time', { 
                        duration: dwellTime,
                        threshold 
                    });
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        const interval = setInterval(checkDwellTime, 1000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(interval);
        };
    }, [threshold, trackEngagement]);

    return hasTracked.current;
}
