import type { Schema, Struct } from '@strapi/strapi';

export interface DishIngredient extends Struct.ComponentSchema {
  collectionName: 'components_dish_ingredients';
  info: {
    description: 'Individual ingredient with quantity and source information';
    displayName: 'Ingredient';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
    optional: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    preparation: Schema.Attribute.String;
    quantity: Schema.Attribute.String;
    source: Schema.Attribute.String;
    substitutions: Schema.Attribute.Text;
    unit: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'dish.ingredient': DishIngredient;
    }
  }
}
