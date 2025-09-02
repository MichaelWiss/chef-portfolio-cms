'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ConsultationModal from '@/components/ConsultationModal';

// Client-only newsletter form to avoid hydration issues
function ClientNewsletterForm() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render placeholder divs during SSR - no form inputs at all
    return (
      <div className="space-y-4">
        <div className="w-full px-4 py-3 border rounded-md h-12 flex items-center" style={{ borderColor: '#d6d3d1', backgroundColor: 'white' }}>
          <span style={{ color: '#78716c' }}>Your first name</span>
        </div>
        <div className="w-full px-4 py-3 border rounded-md h-12 flex items-center" style={{ borderColor: '#d6d3d1', backgroundColor: 'white' }}>
          <span style={{ color: '#78716c' }}>your.email@example.com</span>
        </div>
        <div className="w-full px-6 py-3 rounded-md font-medium text-center text-white" style={{ backgroundColor: '#1c1917' }}>
          Subscribe
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: '#44403c' }}>
          First Name (optional)
        </label>
        <input 
          type="text" 
          placeholder="Your first name" 
          className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:border-transparent transition-colors"
          style={{ 
            borderColor: '#d6d3d1'
          }}
          autoComplete="given-name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: '#44403c' }}>
          Email Address *
        </label>
        <input 
          type="email" 
          placeholder="your.email@example.com" 
          required
          className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:border-transparent transition-colors"
          style={{ 
            borderColor: '#d6d3d1'
          }}
          autoComplete="email"
        />
      </div>

      <button 
        type="submit" 
        className="w-full px-6 py-3 rounded-md font-medium transition-colors text-white hover:bg-stone-800"
        style={{ backgroundColor: '#1c1917' }}
      >
        Subscribe
      </button>
    </form>
  );
}

// Modern Navigation Component
const ModernNavigation = ({ onBookConsultation }: { onBookConsultation: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    setIsScrolled(window.scrollY > 20); // Set initial value after mount
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Only render nav after isScrolled is set (client-side)
  if (isScrolled === undefined) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass shadow-lg py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="font-serif font-display font-semibold text-xl text-secondary-900">
              Kenneth Wiss
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#home" className="nav-link nav-link-active">Home</Link>
            <Link href="#about" className="nav-link">About</Link>
            <Link href="#portfolio" className="nav-link">Portfolio</Link>
            <Link href="#contact" className="nav-link">Contact</Link>
            <button className="btn-primary btn-sm" onClick={onBookConsultation}>Book Consultation</button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 glass rounded-xl">
            <div className="flex flex-col space-y-2 px-4 py-2">
              <Link href="#home" className="nav-link py-2">Home</Link>
              <Link href="#about" className="nav-link py-2">About</Link>
              <Link href="#portfolio" className="nav-link py-2">Portfolio</Link>
              <Link href="#contact" className="nav-link py-2">Contact</Link>
              <button className="btn-primary mt-4" onClick={onBookConsultation}>Book Consultation</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Hero Section - Matching Mockup Design
const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center text-white overflow-hidden" style={{
      background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)'
    }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
        }}></div>
      </div>
      
      {/* Content */}
      <div className="relative text-center space-y-8 max-w-4xl mx-auto px-6 z-10">
        <h1 className="font-serif font-display text-5xl md:text-7xl font-light tracking-wide animate-fade-in-up">
          Culinary Artistry
        </h1>
        <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-100" style={{ color: '#d6d3d1' }}>
          Where seasonal ingredients meet creative passion, crafting unforgettable dining experiences with every dish.
        </p>
        <div className="pt-8 animate-fade-in-up animation-delay-200">
          <a 
            href="#portfolio" 
            className="inline-block px-10 py-4 border-2 border-white text-white hover:bg-white hover:text-stone-900 transition-all duration-300 text-lg font-medium tracking-wide"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            View Portfolio
          </a>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
        <div className="animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
        </div>
      </div>
    </section>
  );
};

// Chef Profile Section - Matching Mockup Design
const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="font-serif font-display text-4xl md:text-5xl font-light mb-6" style={{ color: '#1c1917' }}>
          Meet the Chef
        </h2>
        <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#57534e' }}>
          Discover the passion and expertise behind every carefully crafted dish.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Chef Image */}
        <div className="relative">
          <div 
            className="aspect-[3/4] rounded-lg shadow-lg relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #e7e5e4 0%, #f5f5f4 100%)'
            }}
          >
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16"
              style={{
                background: '#a8a29e',
                mask: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-4.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z'/%3E%3C/svg%3E") no-repeat center`,
                maskSize: 'contain'
              }}
            ></div>
          </div>
        </div>

        {/* Chef Information */}
        <div className="space-y-8">
          <div>
            <h3 className="font-serif font-display text-3xl font-medium mb-3" style={{ color: '#1c1917' }}>
              Kenneth Wiss
            </h3>
            <p className="text-xl mb-6" style={{ color: '#57534e' }}>
              Executive Chef & Culinary Artist
            </p>
            
            <div className="flex items-center gap-3 mb-6" style={{ color: '#78716c' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>New York, New York</span>
            </div>
          </div>

          <div className="prose prose-lg prose-stone max-w-none">
            <p className="leading-relaxed" style={{ color: '#44403c' }}>
              With over 15 years of culinary experience, I believe that food is not just sustenance—it&apos;s storytelling on a plate. My approach combines classical French techniques with seasonal California ingredients, creating dishes that honor tradition while embracing innovation.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#1c1917' }}>Specialties</h4>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 text-sm rounded-full" style={{ backgroundColor: '#f5f5f4', color: '#44403c' }}>Modern French</span>
              <span className="px-4 py-2 text-sm rounded-full" style={{ backgroundColor: '#f5f5f4', color: '#44403c' }}>Seasonal Cuisine</span>
              <span className="px-4 py-2 text-sm rounded-full" style={{ backgroundColor: '#f5f5f4', color: '#44403c' }}>Farm-to-Table</span>
              <span className="px-4 py-2 text-sm rounded-full" style={{ backgroundColor: '#f5f5f4', color: '#44403c' }}>Pastry Arts</span>
            </div>
          </div>

          <div className="rounded-lg p-6" style={{ backgroundColor: '#fafaf9' }}>
            <div className="text-center">
              <div className="text-3xl font-bold font-display" style={{ color: '#1c1917' }}>15+</div>
              <div className="text-sm" style={{ color: '#57534e' }}>Years of Experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Portfolio Section - Matching Mockup Design
const PortfolioSection = () => {
  const dishes = [
    {
      id: 1,
      title: "Seared Duck Breast",
      description: "Pan-seared duck breast with cherry gastrique, roasted fingerling potatoes, and seasonal vegetables.",
      category: "Main Course",
      difficulty: "Medium",
      prepTime: "45min prep",
      servings: "4 servings",
      season: "Autumn"
    },
    {
      id: 2,
      title: "Chocolate Soufflé",
      description: "Rich dark chocolate soufflé with vanilla bean crème anglaise and fresh berry compote.",
      category: "Dessert",
      difficulty: "Hard",
      prepTime: "30min prep",
      servings: "6 servings",
      season: "Year-round"
    },
    {
      id: 3,
      title: "Burrata & Peach",
      description: "Fresh burrata with grilled peaches, arugula, prosciutto, and honey-balsamic reduction.",
      category: "Appetizer",
      difficulty: "Easy",
      prepTime: "15min prep",
      servings: "2 servings",
      season: "Summer"
    },
  ];

  return (
    <section id="portfolio" className="py-24 px-6" style={{ backgroundColor: '#fafaf9' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif font-display text-4xl md:text-5xl font-light mb-6" style={{ color: '#1c1917' }}>
            Signature Dishes
          </h2>
          <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#57534e' }}>
            Each dish tells a story of seasonal ingredients, innovative techniques, and culinary passion.
          </p>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button 
            className="px-6 py-3 rounded-full text-sm font-medium text-white" 
            style={{ backgroundColor: '#1c1917' }}
          >
            All Dishes
          </button>
          <button 
            className="px-6 py-3 rounded-full text-sm font-medium transition-colors hover:bg-stone-100" 
            style={{ backgroundColor: 'white', color: '#44403c' }}
          >
            Appetizers
          </button>
          <button 
            className="px-6 py-3 rounded-full text-sm font-medium transition-colors hover:bg-stone-100" 
            style={{ backgroundColor: 'white', color: '#44403c' }}
          >
            Main Courses
          </button>
          <button 
            className="px-6 py-3 rounded-full text-sm font-medium transition-colors hover:bg-stone-100" 
            style={{ backgroundColor: 'white', color: '#44403c' }}
          >
            Desserts
          </button>
          <button 
            className="px-6 py-3 rounded-full text-sm font-medium transition-colors hover:bg-stone-100" 
            style={{ backgroundColor: 'white', color: '#44403c' }}
          >
            Beverages
          </button>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dishes.map((dish) => (
            <div key={dish.id} className="group cursor-pointer">
              <div 
                className="aspect-[4/3] rounded-lg mb-6 group-hover:shadow-lg transition-shadow duration-300 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #e7e5e4 0%, #f5f5f4 100%)'
                }}
              >
                <div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16"
                  style={{
                    background: '#a8a29e',
                    mask: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-4.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z'/%3E%3C/svg%3E") no-repeat center`,
                    maskSize: 'contain'
                  }}
                ></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 
                    className="text-xl font-semibold group-hover:text-stone-700 transition-colors" 
                    style={{ color: '#1c1917' }}
                  >
                    {dish.title}
                  </h3>
                  <span 
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      dish.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                      dish.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {dish.difficulty}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#57534e' }}>
                  {dish.description}
                </p>
                <div className="flex items-center gap-4 text-xs" style={{ color: '#78716c' }}>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{dish.prepTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span>{dish.servings}</span>
                  </div>
                  <span className="capitalize">{dish.season}</span>
                </div>
                <span 
                  className="inline-block px-3 py-1 text-xs rounded-full" 
                  style={{ backgroundColor: '#f5f5f4', color: '#44403c' }}
                >
                  {dish.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Newsletter Section - Matching Mockup Design
const NewsletterSection = () => {
  return (
    <section className="py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-serif font-display text-4xl md:text-5xl font-light mb-6" style={{ color: '#1c1917' }}>
          Stay Connected
        </h2>
        <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: '#57534e' }}>
          Join our community to receive updates on seasonal menus, exclusive events, and culinary insights.
        </p>
      </div>
      
      <div className="max-w-lg mx-auto">
        <div className="rounded-lg p-8" style={{ backgroundColor: '#fafaf9' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: '#1c1917' }}>
            Join Our Culinary Journey
          </h3>
          <p className="mb-6" style={{ color: '#57534e' }}>
            Subscribe for seasonal menu updates, exclusive recipes, and special event invitations.
          </p>
          
          <ClientNewsletterForm />
          
          <p className="text-xs mt-4 text-center" style={{ color: '#78716c' }}>
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

// Footer - Matching Mockup Design
const Footer = () => {
  return (
    <footer className="text-white py-16 px-6" style={{ backgroundColor: '#1c1917' }}>
      <div className="max-w-7xl mx-auto text-center">
        <div className="mb-8">
          <h3 className="font-serif font-display text-2xl font-light mb-4">Kenneth Wiss</h3>
          <p className="max-w-md mx-auto" style={{ color: '#a8a29e' }}>
            Crafting exceptional culinary experiences with passion, creativity, and seasonal excellence.
          </p>
        </div>
        
        <div className="flex justify-center space-x-6 mb-8">
          <Link href="#" className="transition-colors hover:text-white" style={{ color: '#a8a29e' }}>
            Instagram
          </Link>
          <Link href="#" className="transition-colors hover:text-white" style={{ color: '#a8a29e' }}>
            LinkedIn
          </Link>
          <Link href="#" className="transition-colors hover:text-white" style={{ color: '#a8a29e' }}>
            Contact
          </Link>
        </div>
        
        <p className="text-sm" style={{ color: '#a8a29e' }}>
          © 2025 Chef Portfolio. Crafted with passion for culinary excellence.
        </p>
      </div>
    </footer>
  );
};

// Main Page Component
export default function Page() {
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  const handleBookConsultation = () => {
    setIsConsultationModalOpen(true);
  };

  const handleCloseConsultationModal = () => {
    setIsConsultationModalOpen(false);
  };

  return (
    <div className="min-h-screen font-sans" style={{ color: '#1c1917' }}>
      <ModernNavigation onBookConsultation={handleBookConsultation} />
      <HeroSection />
      <AboutSection />
      <PortfolioSection />
      <NewsletterSection />
      <Footer />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={handleCloseConsultationModal}
      />
    </div>
  );
}
