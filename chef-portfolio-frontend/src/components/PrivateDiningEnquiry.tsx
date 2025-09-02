'use client';

import { useState } from 'react';
import { strapiService } from '@/lib/strapi';
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

type PrivateDiningInquiry = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  eventType: 'private-dining' | 'corporate-event' | 'wedding' | 'consulting' | 'other';
  eventDate: string;
  guestCount: string;
  budget: 'budget-under-5k' | 'budget-5k-to-15k' | 'budget-15k-to-30k' | 'budget-30k-to-50k' | 'budget-over-50k' | 'budget-undisclosed';
  location: string;
  message: string;
  preferredContact: 'email' | 'phone' | 'either';
};

const initialFormData: PrivateDiningInquiry = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  eventType: 'private-dining',
  eventDate: '',
  guestCount: '',
  budget: 'budget-undisclosed',
  location: '',
  message: '',
  preferredContact: 'email',
};

interface PrivateDiningEnquiryProps {
  onSuccess?: () => void;
}

export default function PrivateDiningInquiry({ onSuccess }: PrivateDiningEnquiryProps) {
  const [formData, setFormData] = useState<PrivateDiningInquiry>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PrivateDiningInquiry>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PrivateDiningInquiry> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PrivateDiningInquiry, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const inquiryData = {
        ...formData,
        guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
        eventDate: formData.eventDate || undefined,
      };
      
      await strapiService.submitPrivateDiningInquiry(inquiryData);
      setIsSubmitted(true);
      setFormData(initialFormData);

      // Call onSuccess callback after a short delay to show success message
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-stone-50 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckIcon className="h-12 w-12 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-stone-900 mb-2">
          Thank You for Your Inquiry!
        </h3>
        <p className="text-stone-600">
          We&apos;ve received your request and will be in touch within 24 hours to discuss your culinary vision.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-stone-50 rounded-lg p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-stone-900 mb-2">
          Private Dining Inquiry
        </h3>
        <p className="text-stone-600">
          Let&apos;s create an unforgettable culinary experience for your special occasion.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors ${
                errors.firstName ? 'border-red-300' : 'border-stone-300'
              }`}
              placeholder="Your first name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors ${
                errors.lastName ? 'border-red-300' : 'border-stone-300'
              }`}
              placeholder="Your last name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors ${
              errors.email ? 'border-red-300' : 'border-stone-300'
            }`}
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Company/Organization
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors"
            placeholder="Company name"
          />
        </div>

        {/* Event Details */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Event Type *
          </label>
          <select
            value={formData.eventType}
            onChange={(e) => handleInputChange('eventType', e.target.value as PrivateDiningInquiry['eventType'])}
            className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors"
          >
            <option value="private-dining">Private Dining</option>
            <option value="corporate-event">Corporate Event</option>
            <option value="wedding">Wedding</option>
            <option value="consulting">Consulting</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Preferred Date
            </label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) => handleInputChange('eventDate', e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Number of Guests
            </label>
            <input
              type="number"
              value={formData.guestCount}
              onChange={(e) => handleInputChange('guestCount', e.target.value)}
              className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors"
              placeholder="10"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Budget Range
          </label>
          <select
            value={formData.budget}
            onChange={(e) => handleInputChange('budget', e.target.value as PrivateDiningInquiry['budget'])}
            className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors"
          >
            <option value="budget-undisclosed">Prefer not to disclose</option>
            <option value="budget-under-5k">Under $5,000</option>
            <option value="budget-5k-to-15k">$5,000 - $15,000</option>
            <option value="budget-15k-to-30k">$15,000 - $30,000</option>
            <option value="budget-30k-to-50k">$30,000 - $50,000</option>
            <option value="budget-over-50k">Over $50,000</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Event Location/Venue
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors"
            placeholder="Venue name or address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={4}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors ${
              errors.message ? 'border-red-300' : 'border-stone-300'
            }`}
            placeholder="Tell us about your vision, dietary requirements, or any special requests..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Preferred Contact Method
          </label>
          <select
            value={formData.preferredContact}
            onChange={(e) => handleInputChange('preferredContact', e.target.value as PrivateDiningInquiry['preferredContact'])}
            className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-colors"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="either">Either</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-stone-900 text-white px-6 py-3 rounded-md hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Inquiry'}
        </button>
      </form>

      <p className="text-xs text-stone-500 mt-4">
        We respect your privacy and will only use this information to respond to your inquiry.
      </p>
    </div>
  );
}