/**
 * newsletter controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::newsletter.newsletter', ({ strapi }) => ({
  // Find newsletters by campaign status
  async findByStatus(ctx) {
    const { status } = ctx.params;
    
    try {
      const entries = await strapi.entityService.findMany('api::newsletter.newsletter', {
        filters: { campaignStatus: status },
        populate: ['featuredImage', 'additionalImages', 'featuredDish'],
        sort: { createdAt: 'desc' }
      });

      return entries;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Find newsletters by content type
  async findByType(ctx) {
    const { type } = ctx.params;
    
    try {
      const entries = await strapi.entityService.findMany('api::newsletter.newsletter', {
        filters: { contentType: type },
        populate: ['featuredImage', 'additionalImages', 'featuredDish'],
        sort: { createdAt: 'desc' }
      });

      return entries;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get sent newsletters with analytics
  async getSentCampaigns(ctx) {
    try {
      const entries = await strapi.entityService.findMany('api::newsletter.newsletter', {
        filters: { campaignStatus: 'sent' },
        populate: ['featuredImage', 'featuredDish'],
        sort: { actualSendDate: 'desc' }
      });

      return entries;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Get upcoming scheduled newsletters
  async getScheduled(ctx) {
    try {
      const now = new Date();
      const entries = await strapi.entityService.findMany('api::newsletter.newsletter', {
        filters: { 
          campaignStatus: 'scheduled',
          scheduledSendDate: { $gt: now }
        },
        populate: ['featuredImage', 'featuredDish'],
        sort: { scheduledSendDate: 'asc' }
      });

      return entries;
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}));
