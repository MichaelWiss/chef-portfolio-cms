import axios from 'axios';

const strapiApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for Strapi responses
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiImage {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
  url: string;
}

export interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

// Content type interfaces
export interface DishShowcase {
  id: number;
  title: string;
  description: string;
  category: 'appetizer' | 'main-course' | 'dessert' | 'beverage';
  season?: 'spring' | 'summer' | 'autumn' | 'winter' | 'year-round';
  cookingMethod?: 'grilled' | 'roasted' | 'sauteed' | 'braised' | 'raw' | 'fried' | 'steamed' | 'baked';
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  chefNotes?: string;
  ingredients?: string;
  instructions?: string;
  winePairing?: string;
  featuredImage?: { data: StrapiImage };
  additionalImages?: { data: StrapiImage[] };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ChefProfile {
  id: number;
  fullName: string;
  professionalTitle: string;
  shortBio: string;
  fullBio: string;
  yearsExperience?: number;
  specialties: string[];
  education?: string;
  awards?: string;
  location?: string;
  profileImage?: { data: StrapiImage };
  heroImage?: { data: StrapiImage };
  instagramHandle?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface SiteCopy {
  id: number;
  sectionName: string;
  pageLocation: 'homepage' | 'about' | 'portfolio' | 'contact' | 'global';
  contentType: 'heading' | 'subheading' | 'paragraph' | 'button-text' | 'meta-description';
  content: string;
  isActive: boolean;
  characterLimit?: number;
  audience?: 'general' | 'professional' | 'media';
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface NewsletterSubscriber {
  email: string;
  firstName?: string;
  lastName?: string;
  preferences?: {
    seasonalMenus?: boolean;
    specialEvents?: boolean;
    recipes?: boolean;
    newsUpdates?: boolean;
  };
}

// API functions
export const strapiService = {
  // Dishes
  getDishes: async (params?: { 
    category?: string; 
    season?: string; 
    populate?: string;
    pagination?: { page: number; pageSize: number };
  }): Promise<StrapiResponse<DishShowcase[]>> => {
    const searchParams = new URLSearchParams();
    
    if (params?.category) {
      searchParams.append('filters[category][$eq]', params.category);
    }
    if (params?.season) {
      searchParams.append('filters[season][$eq]', params.season);
    }
    if (params?.populate) {
      searchParams.append('populate', params.populate);
    } else {
      searchParams.append('populate', 'featuredImage,additionalImages');
    }
    if (params?.pagination) {
      searchParams.append('pagination[page]', params.pagination.page.toString());
      searchParams.append('pagination[pageSize]', params.pagination.pageSize.toString());
    }

    const response = await strapiApi.get(`/dish-showcases?${searchParams}`);
    return response.data;
  },

  getDish: async (id: number): Promise<StrapiResponse<DishShowcase>> => {
    const response = await strapiApi.get(`/dish-showcases/${id}?populate=featuredImage,additionalImages`);
    return response.data;
  },

  // Chef Profile
  getChefProfile: async (): Promise<StrapiResponse<ChefProfile>> => {
    const response = await strapiApi.get('/chef-profile?populate=profileImage,heroImage');
    return response.data;
  },

  // Site Copy
  getSiteCopy: async (pageLocation?: string): Promise<StrapiResponse<SiteCopy[]>> => {
    const searchParams = new URLSearchParams();
    searchParams.append('filters[isActive][$eq]', 'true');
    
    if (pageLocation) {
      searchParams.append('filters[pageLocation][$eq]', pageLocation);
    }

    const response = await strapiApi.get(`/site-copies?${searchParams}`);
    return response.data;
  },

  // Newsletter
  subscribeToNewsletter: async (
    subscriberData: NewsletterSubscriber
  ): Promise<StrapiResponse<{ id: number; email: string; firstName?: string }>> => {
    const response = await strapiApi.post('/newsletter-subscribers/subscribe', subscriberData);
    return response.data;
  },

  // Utility function to get full image URL
  getStrapiImageUrl: (image: StrapiImage | undefined): string => {
    if (!image) return '/placeholder-image.jpg';
    
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    return image.url.startsWith('http') ? image.url : `${baseUrl}${image.url}`;
  },

  // Get responsive image URLs
  getResponsiveImageUrls: (image: StrapiImage | undefined) => {
    if (!image) return { src: '/placeholder-image.jpg' };

    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const getFullUrl = (url: string) => url.startsWith('http') ? url : `${baseUrl}${url}`;

    return {
      src: getFullUrl(image.url),
      thumbnail: image.formats?.thumbnail ? getFullUrl(image.formats.thumbnail.url) : getFullUrl(image.url),
      small: image.formats?.small ? getFullUrl(image.formats.small.url) : getFullUrl(image.url),
      medium: image.formats?.medium ? getFullUrl(image.formats.medium.url) : getFullUrl(image.url),
      large: image.formats?.large ? getFullUrl(image.formats.large.url) : getFullUrl(image.url),
    };
  }
};

export default strapiService;
