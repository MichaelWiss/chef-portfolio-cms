/**
 * dish-showcase controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::dish-showcase.dish-showcase', ({ strapi }) => ({
  // Custom controller methods can be added here
  
  // Find published dishes with populated fields
  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    
    // Add any custom logic here
    return { data, meta };
  },

  // Find featured dishes
  async findFeatured(ctx) {
    try {
      const entries = await strapi.entityService.findMany('api::dish-showcase.dish-showcase', {
        filters: { featured: true },
        populate: ['heroImage', 'additionalImages'],
        publicationState: 'live',
        sort: { createdAt: 'desc' }
      });

      return entries;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Find dishes by category
  async findByCategory(ctx) {
    const { category } = ctx.params;
    
    try {
      const entries = await strapi.entityService.findMany('api::dish-showcase.dish-showcase', {
        filters: { category },
        populate: ['heroImage', 'additionalImages'],
        publicationState: 'live',
        sort: { createdAt: 'desc' }
      });

      return entries;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Find dishes by season
  async findBySeason(ctx) {
    const { season } = ctx.params;
    
    try {
      const entries = await strapi.entityService.findMany('api::dish-showcase.dish-showcase', {
        filters: { season },
        populate: ['heroImage', 'additionalImages'],
        publicationState: 'live',
        sort: { createdAt: 'desc' }
      });

      return entries;
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}));
