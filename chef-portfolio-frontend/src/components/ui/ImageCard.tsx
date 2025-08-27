'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ClockIcon, UsersIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface ImageCardProps {
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  title: string;
  description?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  season?: string;
  rating?: number;
  chef?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'featured' | 'compact' | 'hero';
}

export default function ImageCard({
  image,
  title,
  description,
  category,
  difficulty,
  prepTime,
  cookTime,
  servings,
  season,
  rating,
  chef,
  tags,
  onClick,
  className = '',
  variant = 'default'
}: ImageCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getDifficultyConfig = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return { 
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
          label: 'Easy' 
        };
      case 'medium':
        return { 
          color: 'bg-amber-50 text-amber-700 border-amber-200', 
          label: 'Medium' 
        };
      case 'hard':
        return { 
          color: 'bg-red-50 text-red-700 border-red-200', 
          label: 'Hard' 
        };
      default:
        return { 
          color: 'bg-stone-50 text-stone-700 border-stone-200', 
          label: 'Unknown' 
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'featured':
        return {
          container: 'group cursor-pointer transition-all duration-500 hover:shadow-strong',
          imageContainer: 'aspect-[16/10] mb-6',
          contentPadding: 'p-6',
          titleSize: 'text-2xl font-serif'
        };
      case 'compact':
        return {
          container: 'group cursor-pointer transition-all duration-300 hover:shadow-medium',
          imageContainer: 'aspect-square mb-3',
          contentPadding: 'p-4',
          titleSize: 'text-lg font-medium'
        };
      case 'hero':
        return {
          container: 'group cursor-pointer transition-all duration-700 hover:shadow-strong',
          imageContainer: 'aspect-[21/9] mb-8',
          contentPadding: 'p-8',
          titleSize: 'text-3xl font-serif'
        };
      default:
        return {
          container: 'group cursor-pointer transition-all duration-400 hover:shadow-medium',
          imageContainer: 'aspect-[4/3] mb-4',
          contentPadding: 'p-5',
          titleSize: 'text-xl font-semibold'
        };
    }
  };

  const variantClasses = getVariantClasses();
  const difficultyConfig = getDifficultyConfig(difficulty);

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="relative">
            {star <= rating ? (
              <StarIconSolid className="h-4 w-4 text-amber-400" />
            ) : (
              <StarIcon className="h-4 w-4 text-stone-300" />
            )}
          </div>
        ))}
        <span className="text-sm text-stone-500 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <article 
      className={`
        ${variantClasses.container}
        bg-white rounded-lg overflow-hidden shadow-soft
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className={`${variantClasses.imageContainer} relative overflow-hidden bg-stone-100`}>
        {image && !imageError ? (
          <>
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width || 600}
              height={image.height || 450}
              className={`
                w-full h-full object-cover transition-all duration-500
                group-hover:scale-105
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              priority={variant === 'hero' || variant === 'featured'}
            />
            
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 animate-pulse" />
            )}
          </>
        ) : (
          /* Placeholder for missing images */
          <div className="w-full h-full flex items-center justify-center bg-stone-100">
            <div className="text-center text-stone-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-4.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span className="text-sm">Image not available</span>
            </div>
          </div>
        )}

        {/* Overlay elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category badge */}
        {category && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-stone-700 text-xs font-medium rounded-full shadow-sm">
              {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        )}

        {/* Difficulty badge */}
        {difficulty && (
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${difficultyConfig.color} shadow-sm`}>
              {difficultyConfig.label}
            </span>
          </div>
        )}

        {/* Season indicator */}
        {season && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
              {season.charAt(0).toUpperCase() + season.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={variantClasses.contentPadding}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className={`${variantClasses.titleSize} text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-2`}>
            {title}
          </h3>
          {rating && (
            <div className="ml-3 flex-shrink-0">
              {renderStars(rating)}
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-stone-500 mb-4">
          {(prepTime || cookTime) && (
            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              <span>
                {prepTime && cookTime 
                  ? `${prepTime + cookTime}min total`
                  : prepTime 
                    ? `${prepTime}min prep`
                    : `${cookTime}min cook`
                }
              </span>
            </div>
          )}
          
          {servings && (
            <div className="flex items-center gap-1">
              <UsersIcon className="h-3 w-3" />
              <span>{servings} serving{servings !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Chef info */}
        {chef && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-stone-50 rounded-lg">
            {chef.avatar ? (
              <Image
                src={chef.avatar}
                alt={chef.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-stone-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-stone-600">
                  {chef.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
            <span className="text-sm text-stone-700 font-medium">{chef.name}</span>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
