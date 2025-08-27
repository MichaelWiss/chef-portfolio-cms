/**
 * site-copy controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::site-copy.site-copy', ({ strapi }) => ({
  // Find copy by page location
  async findByPage(ctx) {
    const { page } = ctx.params;
    
    try {
      const entries = await strapi.entityService.findMany('api::site-copy.site-copy', {
        filters: { 
          pageLocation: page,
          isActive: true 
        },
        publicationState: 'live',
        sort: { displayOrder: 'asc' }
      });

      return entries;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Find copy by section name
  async findBySection(ctx) {
    const { section } = ctx.params;
    
    try {
      const entry = await strapi.entityService.findMany('api::site-copy.site-copy', {
        filters: { 
          sectionName: section,
          isActive: true 
        },
        publicationState: 'live'
      });

      return entry[0] || null;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Find copy by content type
  async findByType(ctx) {
    const { type } = ctx.params;
    
    try {
      const entries = await strapi.entityService.findMany('api::site-copy.site-copy', {
        filters: { 
          contentType: type,
          isActive: true 
        },
        publicationState: 'live',
        sort: { displayOrder: 'asc' }
      });

      return entries;
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}));
