export default {
  routes: [
    {
      method: 'GET',
      path: '/dish-showcases',
      handler: 'dish-showcase.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/dish-showcases/featured',
      handler: 'dish-showcase.findFeatured',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/dish-showcases/category/:category',
      handler: 'dish-showcase.findByCategory',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/dish-showcases/season/:season',
      handler: 'dish-showcase.findBySeason',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/dish-showcases/:id',
      handler: 'dish-showcase.findOne',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/dish-showcases',
      handler: 'dish-showcase.create',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/dish-showcases/:id',
      handler: 'dish-showcase.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/dish-showcases/:id',
      handler: 'dish-showcase.delete',
      config: {
        policies: [],
      },
    },
  ],
};
