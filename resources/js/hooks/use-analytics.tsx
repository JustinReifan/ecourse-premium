import { useCallback } from 'react';

interface AnalyticsEvent {
    event_type: 'visit' | 'scroll' | 'engagement' | 'conversion' | 'payment';
    event_data?: Record<string, any>;
    referral_source?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
}

export function useAnalytics() {
    const coursePrice = import.meta.env.VITE_COURSE_PRICE;
    const track = useCallback(async (event: AnalyticsEvent) => {
        try {
            // Get URL parameters for UTM tracking
            const urlParams = new URLSearchParams(window.location.search);
            const eventData = {
                ...event,
                referral_source: event.referral_source || urlParams.get('ref') || document.referrer || 'direct',
                utm_source: event.utm_source || urlParams.get('utm_source'),
                utm_medium: event.utm_medium || urlParams.get('utm_medium'),
                utm_campaign: event.utm_campaign || urlParams.get('utm_campaign'),
                utm_content: event.utm_content || urlParams.get('utm_content'),
                utm_term: event.utm_term || urlParams.get('utm_term'),
            };

            await fetch(route('analytics.track'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',

                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(eventData),
            });
        } catch (error) {
            // Silent fail for analytics
            console.debug('Analytics tracking failed:', error);
        }
    }, []);

    const trackVisit = useCallback(() => {
        track({
            event_type: 'visit',
            event_data: {
                page: window.location.pathname,
                timestamp: new Date().toISOString(),
            },
        });
    }, [track]);

    const trackScroll = useCallback(
        (depth: number) => {
            track({
                event_type: 'scroll',
                event_data: {
                    depth,
                    page: window.location.pathname,
                    timestamp: new Date().toISOString(),
                },
            });
        },
        [track],
    );

    const trackEngagement = useCallback(
        (type: string, data?: Record<string, any>) => {
            track({
                event_type: 'engagement',
                event_data: {
                    type,
                    page: window.location.pathname,
                    timestamp: new Date().toISOString(),
                    ...data,
                },
            });
        },
        [track],
    );

    const trackConversion = useCallback(
        (type: string, data?: Record<string, any>) => {
            track({
                event_type: 'conversion',
                event_data: {
                    type,
                    page: window.location.pathname,
                    timestamp: new Date().toISOString(),
                    ...data,
                },
            });
        },
        [track],
    );

    const trackPayment = useCallback(
        (status: string, data?: Record<string, any>) => {
            track({
                event_type: 'payment',
                event_data: {
                    status,
                    amount: coursePrice,
                    currency: 'IDR',
                    timestamp: new Date().toISOString(),
                    ...data,
                },
            });
        },
        [track],
    );

    return {
        track,
        trackVisit,
        trackScroll,
        trackEngagement,
        trackConversion,
        trackPayment,
    };
}
