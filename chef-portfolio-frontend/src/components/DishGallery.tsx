'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { strapiService, DishShowcase } from '@/lib/strapi';
import { ClockIcon, UsersIcon } from '@heroicons/react/24/outline';

interface DishGalleryProps {
  category?: string;
  limit?: number;
}

export default function DishGallery({ category, limit = 6 }: DishGalleryProps) {
  const [dishes, setDishes] = useState<DishShowcase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(category || 'all');

  const categories = [
    { value: 'all', label: 'All Dishes' },
    { value: 'appetizer', label: 'Appetizers' },
    { value: 'main-course', label: 'Main Courses' },
    { value: 'dessert', label: 'Desserts' },
    { value: 'beverage', label: 'Beverages' }
  ];

  useEffect(() => {
    const fetchDishes = async () => {
      setIsLoading(true);
      try {
        const params = {
          populate: 'featuredImage',
          pagination: { page: 1, pageSize: limit },
          ...(selectedCategory !== 'all' && { category: selectedCategory })
        };
        
        const response = await strapiService.getDishes(params);
        setDishes(response.data);
      } catch (error) {
        console.error('Error fetching dishes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDishes();
  }, [selectedCategory, limit]);

  const getDifficultyClass = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'badge badge-easy';
      case 'medium': return 'badge badge-medium';
      case 'hard': return 'badge badge-hard';
      default: return 'badge';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/3] bg-stone-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-stone-200 rounded mb-2"></div>
            <div className="h-3 bg-stone-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Filter (Can be externally controlled; keeping internal for now) */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.value
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dishes.map((dish) => (
          <div key={dish.id} className="group cursor-pointer">
            <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-stone-100">
              {dish.featuredImage?.data ? (
                <Image
                  src={strapiService.getStrapiImageUrl(dish.featuredImage.data)}
                  alt={dish.featuredImage.data.alternativeText || dish.title}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  No image available
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-900 group-hover:text-stone-700 transition-colors">
                  {dish.title}
                </h3>
                {dish.difficulty && (
                  <span className={getDifficultyClass(dish.difficulty)}>
                    {dish.difficulty}
                  </span>
                )}
              </div>

              <p className="text-stone-600 text-sm line-clamp-2">
                {dish.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-stone-500">
                {dish.prepTime && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>{dish.prepTime}min prep</span>
                  </div>
                )}
                {dish.servings && (
                  <div className="flex items-center gap-1">
                    <UsersIcon className="h-3 w-3" />
                    <span>{dish.servings} servings</span>
                  </div>
                )}
                {dish.season && (
                  <span className="capitalize">{dish.season}</span>
                )}
              </div>

              {dish.category && (
                <span className="inline-block px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-full capitalize">
                  {dish.category.replace('-', ' ')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {dishes.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-stone-600">No dishes found in this category.</p>
        </div>
      )}
    </div>
  );
}
