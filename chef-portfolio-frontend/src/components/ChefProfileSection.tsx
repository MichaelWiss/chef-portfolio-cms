'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { strapiService, ChefProfile } from '@/lib/strapi';
import { MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function ChefProfileSection() {
  const [chef, setChef] = useState<ChefProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChefProfile = async () => {
      try {
        const response = await strapiService.getChefProfile();
        setChef(response.data);
      } catch (error) {
        console.error('Error fetching chef profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChefProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-[3/4] bg-stone-200 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-stone-200 rounded w-3/4"></div>
            <div className="h-6 bg-stone-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-stone-200 rounded"></div>
              <div className="h-4 bg-stone-200 rounded"></div>
              <div className="h-4 bg-stone-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chef) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-600">Chef profile not available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Chef Image */}
      <div className="relative">
        {chef.profileImage?.data ? (
          <Image
            src={strapiService.getStrapiImageUrl(chef.profileImage.data)}
            alt={chef.profileImage.data.alternativeText || chef.fullName}
            width={600}
            height={800}
            className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-full aspect-[3/4] bg-stone-200 rounded-lg flex items-center justify-center">
            <span className="text-stone-400">No image available</span>
          </div>
        )}
      </div>

      {/* Chef Information */}
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 mb-2">
            {chef.fullName}
          </h2>
          <p className="text-lg text-stone-600 mb-4">
            {chef.professionalTitle}
          </p>
          
          {chef.location && (
            <div className="flex items-center gap-2 text-stone-500 mb-4">
              <MapPinIcon className="h-4 w-4" />
              <span className="text-sm">{chef.location}</span>
            </div>
          )}
        </div>

        <div className="prose prose-stone max-w-none">
          <p className="text-stone-700 leading-relaxed">
            {chef.shortBio || chef.fullBio}
          </p>
        </div>

        {chef.specialties && chef.specialties.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-stone-900 mb-3">
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {chef.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-stone-100 text-stone-700 text-sm rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {chef.yearsExperience && (
          <div className="bg-stone-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-stone-900">
                {chef.yearsExperience}+
              </div>
              <div className="text-sm text-stone-600">
                Years of Experience
              </div>
            </div>
          </div>
        )}

        {chef.awards && (
          <div>
            <h3 className="text-lg font-semibold text-stone-900 mb-3">
              Recognition
            </h3>
            <p className="text-stone-700">{chef.awards}</p>
          </div>
        )}

        {chef.education && (
          <div>
            <h3 className="text-lg font-semibold text-stone-900 mb-3">
              Education
            </h3>
            <p className="text-stone-700">{chef.education}</p>
          </div>
        )}

        {/* Contact Links */}
        <div className="flex flex-wrap gap-4 pt-4">
          {chef.websiteUrl && (
            <a
              href={chef.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <GlobeAltIcon className="h-4 w-4" />
              <span className="text-sm">Website</span>
            </a>
          )}
          
          {chef.instagramHandle && (
            <a
              href={`https://instagram.com/${chef.instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <span className="text-sm">@{chef.instagramHandle.replace('@', '')}</span>
            </a>
          )}

          {chef.linkedinUrl && (
            <a
              href={chef.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <span className="text-sm">LinkedIn</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
