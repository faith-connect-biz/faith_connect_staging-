// Simple analytics service for tracking user interactions
interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;

  constructor() {
    // Load events from localStorage on initialization
    this.loadEvents();
  }

  private loadEvents() {
    try {
      const stored = localStorage.getItem('analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics events:', error);
    }
  }

  private saveEvents() {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to save analytics events:', error);
    }
  }

  track(event: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    };

    this.events.push(analyticsEvent);
    this.saveEvents();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', analyticsEvent);
    }

    // In a real application, you would send this to your analytics service
    // this.sendToAnalyticsService(analyticsEvent);
  }

  // Track service detail page interactions
  trackServiceBookingClick(serviceId: string, serviceName: string, businessId: string) {
    this.track('service_booking_click', {
      service_id: serviceId,
      service_name: serviceName,
      business_id: businessId,
      action: 'book_service'
    });
  }

  trackContactShowClick(businessId: string, businessName: string) {
    this.track('contact_show_click', {
      business_id: businessId,
      business_name: businessName,
      action: 'show_contact'
    });
  }

  trackWhatsAppClick(businessId: string, businessName: string, whatsappNumber: string) {
    this.track('whatsapp_click', {
      business_id: businessId,
      business_name: businessName,
      whatsapp_number: whatsappNumber,
      action: 'start_chat'
    });
  }

  trackServiceView(serviceId: string, serviceName: string, businessId: string) {
    this.track('service_view', {
      service_id: serviceId,
      service_name: serviceName,
      business_id: businessId,
      action: 'view_service'
    });
  }

  // Get analytics data for reporting
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getEventsByType(eventType: string): AnalyticsEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  getBusinessEngagement(businessId: string): AnalyticsEvent[] {
    return this.events.filter(event => 
      event.properties.business_id === businessId
    );
  }

  // Clear all events (useful for testing or privacy)
  clearEvents() {
    this.events = [];
    this.saveEvents();
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();
export default analytics;

