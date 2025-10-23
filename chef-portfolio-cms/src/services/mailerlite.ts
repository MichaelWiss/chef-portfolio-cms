import MailerLite from '@mailerlite/mailerlite-nodejs';

class MailerLiteService {
  private client: any;
  
  constructor() {
    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      console.warn('MailerLite API key not configured - newsletter sync disabled');
      return;
    }
    
    this.client = new MailerLite({ api_key: apiKey });
  }

  /**
   * Add a subscriber to MailerLite
   */
  async addSubscriber(subscriberData: {
    email: string;
    firstName?: string;
    lastName?: string;
    preferences?: any;
    customFields?: Record<string, any>;
  }) {
    if (!this.client) {
      console.warn('MailerLite client not initialized');
      return null;
    }

    try {
      const fields: any = {};
      
      // Add name fields if provided
      if (subscriberData.firstName) {
        fields['name'] = subscriberData.firstName;
      }
      if (subscriberData.lastName) {
        fields['last_name'] = subscriberData.lastName;
      }
      
      const params = {
        email: subscriberData.email,
        fields,
        status: 'active' as const,
      };

      const response = await this.client.subscribers.createOrUpdate(params);
      
      strapi.log.info('Subscriber added to MailerLite:', {
        email: subscriberData.email,
        success: true
      });
      
      return response.data;
    } catch (error) {
      strapi.log.error('Failed to add subscriber to MailerLite:', error);
      // Don't throw error to avoid breaking subscriber creation in Strapi
      return null;
    }
  }

  /**
   * Update subscriber in MailerLite
   */
  async updateSubscriber(email: string, updates: any) {
    if (!this.client) return null;

    try {
      const response = await this.client.subscribers.createOrUpdate({
        email,
        ...updates
      });
      strapi.log.info('Subscriber updated in MailerLite:', { email });
      return response.data;
    } catch (error) {
      strapi.log.error('Failed to update subscriber in MailerLite:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from MailerLite
   */
  async unsubscribeSubscriber(email: string) {
    if (!this.client) return null;

    try {
      const response = await this.client.subscribers.createOrUpdate({
        email,
        status: 'unsubscribed' as const
      });
      strapi.log.info('Subscriber unsubscribed from MailerLite:', { email });
      return response.data;
    } catch (error) {
      strapi.log.error('Failed to unsubscribe from MailerLite:', error);
      return null;
    }
  }

  /**
   * Check if MailerLite is configured
   */
  isConfigured() {
    return !!this.client;
  }

  /**
   * Sync all Strapi subscribers to MailerLite
   */
  async syncAllSubscribers() {
    if (!this.client) {
      strapi.log.warn('MailerLite client not initialized - skipping sync');
      return { success: 0, failed: 0, errors: [] };
    }

    try {
      // Get all active subscribers from Strapi
      const subscribers = await strapi.entityService.findMany(
        'api::newsletter-subscriber.newsletter-subscriber',
        {
          filters: { subscriberStatus: 'active' },
          limit: 1000 // Adjust as needed
        }
      );

      strapi.log.info(`Syncing ${subscribers.length} subscribers to MailerLite`);

      const results = {
        success: 0,
        failed: 0,
        errors: [] as any[]
      };

      for (const subscriber of subscribers) {
        const result = await this.addSubscriber({
          email: subscriber.email,
          firstName: subscriber.firstName,
          lastName: subscriber.lastName,
          preferences: {
            favoriteType: subscriber.favoriteType,
            dietaryRestrictions: subscriber.dietaryRestrictions
          },
          customFields: {
            strapi_id: subscriber.id,
            subscription_date: subscriber.subscriptionDate,
            subscription_source: subscriber.subscriptionSource,
            vip_status: subscriber.vipStatus ? 'yes' : 'no'
          }
        });
        
        if (result) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ email: subscriber.email, error: 'Failed to sync' });
        }
      }

      strapi.log.info('MailerLite sync completed:', results);
      return results;
    } catch (error) {
      strapi.log.error('Failed to sync subscribers to MailerLite:', error);
      return { success: 0, failed: 0, errors: [{ error: error.message }] };
    }
  }
}

export default new MailerLiteService();