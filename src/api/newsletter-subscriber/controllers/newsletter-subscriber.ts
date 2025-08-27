/**
 * newsletter-subscriber controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::newsletter-subscriber.newsletter-subscriber', ({ strapi }) => ({
  // Subscribe a new email
  async subscribe(ctx) {
    const { email, firstName, lastName, preferences, source } = ctx.request.body;
    
    try {
      // Check if email already exists
      const existingSubscriber = await strapi.entityService.findMany('api::newsletter-subscriber.newsletter-subscriber', {
        filters: { email }
      });

      if (existingSubscriber.length > 0) {
        return ctx.badRequest('Email already subscribed');
      }

      // Create new subscriber
      const subscriber = await strapi.entityService.create('api::newsletter-subscriber.newsletter-subscriber', {
        data: {
          email,
          firstName,
          lastName,
          preferences: preferences || {},
          subscriptionSource: source || 'website',
          subscriptionDate: new Date(),
          subscriberStatus: 'active',
          ipAddress: ctx.request.ip,
          userAgent: ctx.request.headers['user-agent']
        }
      });

      return subscriber;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Unsubscribe
  async unsubscribe(ctx) {
    const { email, reason } = ctx.request.body;
    
    try {
      const subscribers = await strapi.entityService.findMany('api::newsletter-subscriber.newsletter-subscriber', {
        filters: { email }
      });

      if (subscribers.length === 0) {
        return ctx.notFound('Subscriber not found');
      }

      const updated = await strapi.entityService.update('api::newsletter-subscriber.newsletter-subscriber', subscribers[0].id, {
        data: {
          subscriberStatus: 'unsubscribed',
          unsubscribeDate: new Date(),
          unsubscribeReason: reason
        }
      });

      return { message: 'Successfully unsubscribed' };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get active subscribers
  async getActive(ctx) {
    try {
      const entries = await strapi.entityService.findMany('api::newsletter-subscriber.newsletter-subscriber', {
        filters: { subscriberStatus: 'active' },
        sort: { subscriptionDate: 'desc' }
      });

      return entries;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get VIP subscribers
  async getVip(ctx) {
    try {
      const entries = await strapi.entityService.findMany('api::newsletter-subscriber.newsletter-subscriber', {
        filters: { 
          subscriberStatus: 'active',
          vipStatus: true 
        },
        sort: { subscriptionDate: 'desc' }
      });

      return entries;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get subscribers by preference
  async getByPreference(ctx) {
    const { preference } = ctx.params;
    
    try {
      const entries = await strapi.entityService.findMany('api::newsletter-subscriber.newsletter-subscriber', {
        filters: { 
          subscriberStatus: 'active',
          favoriteType: preference 
        },
        sort: { subscriptionDate: 'desc' }
      });

      return entries;
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}));
