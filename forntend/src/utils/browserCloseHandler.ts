/**
 * Browser Close Detection Utility
 * Handles beforeunload and pagehide events to detect when user closes browser/tab
 */

interface BrowserCloseOptions {
  userId: string;
  sessionId?: string;
  userType?: string;
  onBeforeUnload?: () => void;
  onPageHide?: () => void;
  serverUrl?: string;
}

class BrowserCloseHandler {
  private isHandling = false;
  private options: BrowserCloseOptions | null = null;

  /**
   * Setup browser close detection
   */
  setup(options: BrowserCloseOptions): void {
    if (typeof window === 'undefined') return;

    this.options = options;
    this.isHandling = true;

    // Handle beforeunload event (desktop browsers)
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    // Handle pagehide event (mobile browsers)
    window.addEventListener('pagehide', this.handlePageHide.bind(this));

    // Handle visibilitychange event (tab switching)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    console.log('🔍 Browser close detection setup for user:', options.userId);
  }

  /**
   * Remove browser close detection
   */
  remove(): void {
    if (typeof window === 'undefined') return;

    this.isHandling = false;
    this.options = null;

    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    window.removeEventListener('pagehide', this.handlePageHide.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    console.log('🔍 Browser close detection removed');
  }

  /**
   * Handle beforeunload event
   */
  private handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.isHandling || !this.options) return;

    console.log('🔍 beforeunload event triggered');
    
    // Call custom handler if provided
    if (this.options.onBeforeUnload) {
      this.options.onBeforeUnload();
    }

    // Send logout request
    this.sendLogoutRequest('browser_close');

    // Note: We don't prevent the default behavior to allow the page to close
  }

  /**
   * Handle pagehide event
   */
  private handlePageHide(event: PageTransitionEvent): void {
    if (!this.isHandling || !this.options) return;

    console.log('🔍 pagehide event triggered');
    
    // Call custom handler if provided
    if (this.options.onPageHide) {
      this.options.onPageHide();
    }

    // Send logout request
    this.sendLogoutRequest('browser_close');
  }

  /**
   * Handle visibility change event
   */
  private handleVisibilityChange(): void {
    if (!this.isHandling || !this.options) return;

    if (document.visibilityState === 'hidden') {
      console.log('🔍 Page became hidden');
      // You might want to send a "user away" status here
      // this.sendUserAwayRequest();
    } else if (document.visibilityState === 'visible') {
      console.log('🔍 Page became visible');
      // You might want to send a "user back" status here
      // this.sendUserBackRequest();
    }
  }

  /**
   * Send logout request to backend
   */
  private sendLogoutRequest(reason: string): void {
    if (!this.options) return;

    const { userId, sessionId, serverUrl, userType } = this.options;
    const url = serverUrl || process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';

    try {
      const data = JSON.stringify({ 
        userId, 
        sessionId, 
        reason 
      });

      // Use sendBeacon for reliable delivery during page unload
      if (navigator.sendBeacon) {
        const success = navigator.sendBeacon(`${url}/api/logout/browser-close`, data);
        console.log('📡 Logout request sent via sendBeacon:', success);
      } else {
        // Fallback to fetch with keepalive
        fetch(`${url}/api/logout/browser-close`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: data,
          keepalive: true
        }).then(() => {
          console.log('📡 Logout request sent via fetch');
        }).catch((error) => {
          console.error('❌ Failed to send logout request:', error);
        });
      }

      // If user is a farmer, also set their availability to false (busy)
      if (userType === 'farmer') {
        const availabilityData = JSON.stringify({
          userId: userId,
          available: false // Set to busy/unavailable on browser close
        });

        // Use fetch with keepalive instead of sendBeacon for proper JSON handling
        fetch(`${url}/api/user-status/farmer-availability`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: availabilityData,
          keepalive: true
        }).then(() => {
          console.log('📡 Farmer availability set to false via fetch');
        }).catch((error) => {
          console.error('❌ Failed to set farmer availability to false:', error);
        });
      }
    } catch (error) {
      console.error('❌ Error sending logout request:', error);
    }
  }

  /**
   * Send user away request (when tab becomes hidden)
   */
  private sendUserAwayRequest(): void {
    if (!this.options) return;

    const { userId, serverUrl } = this.options;
    const url = serverUrl || process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';

    try {
      const data = JSON.stringify({ 
        userId, 
        reason: 'tab_hidden' 
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${url}/api/user-status/activity`, data);
      }
    } catch (error) {
      console.error('❌ Error sending user away request:', error);
    }
  }

  /**
   * Send user back request (when tab becomes visible)
   */
  private sendUserBackRequest(): void {
    if (!this.options) return;

    const { userId, serverUrl } = this.options;
    const url = serverUrl || process.env.NEXT_PUBLIC_DISPATCHER_URL || 'http://localhost:3004';

    try {
      const data = JSON.stringify({ 
        userId, 
        reason: 'tab_visible' 
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${url}/api/user-status/activity`, data);
      }
    } catch (error) {
      console.error('❌ Error sending user back request:', error);
    }
  }
}

// Export singleton instance
export const browserCloseHandler = new BrowserCloseHandler();

// React hook for using browser close detection
export const useBrowserCloseDetection = (options: BrowserCloseOptions) => {
  if (typeof window !== 'undefined') {
    const React = require('react');
    
    React.useEffect(() => {
      browserCloseHandler.setup(options);

      return () => {
        browserCloseHandler.remove();
      };
    }, [options.userId, options.sessionId]);
  }
};

export default browserCloseHandler;
