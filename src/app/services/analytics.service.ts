import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

declare var gtag: (...args: any[]) => void;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

    /**
     * Sets the user ID for Google Analytics tracking.
     *
     * <param name="userId">The unique identifier of the authenticated user.</param>
     */
    setUserId(userId: number): void {
        if (environment.gtm && typeof gtag === 'function') {
            const userIdStr = userId.toString();

            // Ensure initial pageview also includes user_id
            gtag('config', environment.gtm, {
                user_id: userIdStr
            });

            // Set user_id for all future hits
            gtag('set', {
                user_id: userIdStr
            });
        }
    }

    /**
     * Sends a Google Analytics event.
     *
     * @param eventName The name of the event to send.
     * @param params Optional event parameters.
     */
    sendAnalyticsEvent(eventName: string, params?: Record<string, any>): void {
        if (environment.gtm && typeof gtag === 'function') {
            gtag('event', eventName, params || {});
        }
    }
}