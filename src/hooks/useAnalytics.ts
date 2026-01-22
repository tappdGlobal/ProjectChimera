import { useEffect } from "react";
import { usePostHog } from "posthog-react-native";

interface ScreenProperties {
  [key: string]: any;
}

interface EventProperties {
  [key: string]: any;
}

/**
 * Custom hook for PostHog analytics tracking
 * Provides consistent interface for tracking screens, events, and user identification
 */
export function useAnalytics(screenName: string, screenProperties?: ScreenProperties) {
  const posthog = usePostHog();

  // Automatically track screen view when component mounts
  useEffect(() => {
    if (posthog && screenName) {
      posthog.screen(screenName, screenProperties);
    }
  }, [posthog, screenName]);

  /**
   * Track a custom event
   * @param eventName - Name of the event (e.g., "button_clicked", "form_submitted")
   * @param properties - Additional properties for the event
   */
  const trackEvent = (eventName: string, properties?: EventProperties) => {
    if (posthog) {
      posthog.capture(eventName, properties);
    }
  };

  /**
   * Identify user with PostHog
   * @param userId - Unique user identifier
   * @param userProperties - User properties (email, name, etc.)
   */
  const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
    if (posthog) {
      posthog.identify(userId, userProperties);
    }
  };

  /**
   * Reset user identity (on logout)
   */
  const resetUser = () => {
    if (posthog) {
      posthog.reset();
    }
  };

  /**
   * Track button click with consistent naming
   * @param buttonName - Name/label of the button
   * @param additionalProperties - Additional context
   */
  const trackButtonClick = (buttonName: string, additionalProperties?: EventProperties) => {
    trackEvent("button_clicked", {
      button_name: buttonName,
      screen: screenName,
      ...additionalProperties,
    });
  };

  /**
   * Track navigation event
   * @param destination - Screen navigating to
   * @param method - How navigation was triggered (e.g., "button", "swipe", "link")
   */
  const trackNavigation = (destination: string, method?: string) => {
    trackEvent("navigation", {
      from: screenName,
      to: destination,
      method: method || "unknown",
    });
  };

  /**
   * Track form submission
   * @param formName - Name of the form
   * @param success - Whether submission was successful
   * @param errorMessage - Error message if failed
   */
  const trackFormSubmit = (formName: string, success: boolean, errorMessage?: string) => {
    trackEvent("form_submitted", {
      form_name: formName,
      screen: screenName,
      success,
      error_message: errorMessage,
    });
  };

  /**
   * Track search query
   * @param query - Search query string
   * @param resultsCount - Number of results returned
   */
  const trackSearch = (query: string, resultsCount?: number) => {
    trackEvent("search_performed", {
      query,
      results_count: resultsCount,
      screen: screenName,
    });
  };

  return {
    trackEvent,
    identifyUser,
    resetUser,
    trackButtonClick,
    trackNavigation,
    trackFormSubmit,
    trackSearch,
  };
}
