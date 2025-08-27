'use client';

import { useState } from 'react';
import { strapiService } from '@/lib/strapi';
import { CheckIcon } from '@heroicons/react/24/outline';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await strapiService.subscribeToNewsletter({
        email,
        firstName: firstName || undefined,
        preferences: {
          seasonalMenus: true,
          specialEvents: true,
          recipes: true,
          newsUpdates: true,
        }
      });
      
      setIsSubscribed(true);
      setEmail('');
      setFirstName('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="bg-stone-50 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckIcon className="h-12 w-12 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-stone-900 mb-2">
          Welcome to the journey!
        </h3>
        <p className="text-stone-600">
          Thank you for subscribing. You&apos;ll receive updates about seasonal menus, 
          special events, and culinary insights.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 rounded-lg p-8">
      <h3 className="text-xl font-semibold text-stone-900 mb-4">
        Join Our Culinary Journey
      </h3>
      <p className="text-stone-600 mb-6">
        Subscribe for seasonal menu updates, exclusive recipes, and special event invitations.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-stone-700 mb-1">
            First Name (optional)
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors"
            placeholder="Your first name"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors"
            placeholder="your.email@example.com"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full bg-stone-900 text-white px-6 py-3 rounded-md hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      
      <p className="text-xs text-stone-500 mt-4">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
}
