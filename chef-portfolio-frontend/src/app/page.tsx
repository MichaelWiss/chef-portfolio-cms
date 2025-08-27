'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Client-only contact form to avoid hydration issues
function ClientContactForm() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render placeholder divs during SSR - no form inputs at all
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full px-4 py-3 rounded-lg border border-secondary-200 bg-white text-secondary-900 h-12 flex items-center">
            <span className="text-secondary-400">First Name</span>
          </div>
          <div className="w-full px-4 py-3 rounded-lg border border-secondary-200 bg-white text-secondary-900 h-12 flex items-center">
            <span className="text-secondary-400">Last Name</span>
          </div>
        </div>
        <div className="w-full px-4 py-3 rounded-lg border border-secondary-200 bg-white text-secondary-900 h-12 flex items-center">
          <span className="text-secondary-400">Email Address</span>
        </div>
        <div className="w-full px-4 py-3 rounded-lg border border-secondary-200 bg-white text-secondary-900 h-12 flex items-center">
          <span className="text-secondary-400">Event Type</span>
        </div>
        <div className="w-full px-4 py-3 rounded-lg border border-secondary-200 bg-white text-secondary-900 h-32 flex items-start pt-3">
          <span className="text-secondary-400">Message</span>
        </div>
        <div className="btn-primary w-full text-center">
          Send Message
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">First Name</label>
          <input 
            type="text" 
            className="input" 
            placeholder="Your first name" 
            autoComplete="given-name"
          />
        </div>
        <div>
          <label className="label">Last Name</label>
          <input 
            type="text" 
            className="input" 
            placeholder="Your last name" 
            autoComplete="family-name"
          />
        </div>
      </div>
      <div>
        <label className="label">Email Address</label>
        <input 
          type="email" 
          className="input" 
          placeholder="your.email@example.com" 
          autoComplete="email"
        />
      </div>
      <div>
        <label className="label">Event Type</label>
        <select className="input">
          <option>Private Dinner</option>
          <option>Wedding</option>
          <option>Corporate Event</option>
          <option>Cooking Class</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label className="label">Message</label>
        <textarea 
          className="input min-h-[120px] resize-none" 
          placeholder="Tell me about your event and culinary vision..." 
          autoComplete="off"
        />
      </div>
      <button type="submit" className="btn-primary w-full">
        Send Message
      </button>
    </form>
  );
}

// Modern Navigation Component
const ModernNavigation = () => {
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
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">AC</span>
            </div>
            <span className="font-display font-semibold text-xl text-secondary-900">
              Alexandra Chen
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#home" className="nav-link nav-link-active">Home</Link>
            <Link href="#about" className="nav-link">About</Link>
            <Link href="#portfolio" className="nav-link">Portfolio</Link>
            <Link href="#contact" className="nav-link">Contact</Link>
            <button className="btn-primary btn-sm">Book Consultation</button>
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
              <button className="btn-primary mt-4">Book Consultation</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Modern Hero Section
const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 md:px-6">
        <div className="animate-fade-in-up">
          <h1 className="heading-1 text-white mb-6">
            Culinary Excellence
            <span className="block text-primary-400">Redefined</span>
          </h1>
          <p className="body-large text-white/90 max-w-3xl mx-auto mb-8">
            Experience the art of modern gastronomy where innovation meets tradition, 
            creating unforgettable dining experiences that tantalize every sense.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary btn-lg hover-glow"
            >
              Explore My Work
            </button>
            <button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary btn-lg glass"
            >
              Meet the Chef
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 animate-fade-in-up animation-delay-500">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-display font-bold text-primary-400 mb-2">15+</div>
            <div className="text-white/80 text-sm md:text-base">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-display font-bold text-primary-400 mb-2">500+</div>
            <div className="text-white/80 text-sm md:text-base">Signature Dishes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-display font-bold text-primary-400 mb-2">50+</div>
            <div className="text-white/80 text-sm md:text-base">Awards</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-display font-bold text-primary-400 mb-2">10k+</div>
            <div className="text-white/80 text-sm md:text-base">Happy Guests</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    </section>
  );
};

// Modern About Section
const AboutSection = () => {
  return (
    <section id="about" className="section bg-white">
      <div className="section-container">
        <div className="grid-feature">
          {/* Image */}
          <div className="order-2 lg:order-1">
            <div className="image-frame aspect-[3/4] hover-lift">
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <p className="text-primary-700 font-medium">Chef Portrait</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="animate-slide-in-right">
              <div className="badge-primary mb-4">Meet the Chef</div>
              <h2 className="heading-2 mb-6">Alexandra Chen</h2>
              <h3 className="text-xl text-primary-600 font-display font-medium mb-6">
                Executive Chef & Culinary Innovator
              </h3>
            </div>

            <div className="space-y-4 animate-slide-in-right animation-delay-200">
              <p className="body-base">
                With over 15 years of culinary expertise, I&apos;ve dedicated my career to pushing the boundaries 
                of modern gastronomy while honoring classical techniques. My journey began in the prestigious 
                kitchens of France and has evolved into a unique culinary philosophy.
              </p>
              <p className="body-base">
                I believe that exceptional cuisine is born from the perfect harmony of innovation, tradition, 
                and the finest seasonal ingredients. Every dish I create tells a story—of place, of season, 
                and of the passionate pursuit of culinary excellence.
              </p>
            </div>

            {/* Specialties */}
            <div className="animate-slide-in-right animation-delay-400">
              <h4 className="text-lg font-semibold text-secondary-900 mb-4">Culinary Specialties</h4>
              <div className="flex flex-wrap gap-3">
                <span className="badge-primary">Modern French</span>
                <span className="badge-primary">Molecular Gastronomy</span>
                <span className="badge-primary">Farm-to-Table</span>
                <span className="badge-primary">Wine Pairing</span>
                <span className="badge-primary">Pastry Arts</span>
              </div>
            </div>

            {/* Experience Highlights */}
            <div className="grid grid-cols-2 gap-4 animate-slide-in-right animation-delay-600">
              <div className="card-gradient p-6 text-center">
                <div className="text-2xl font-display font-bold text-primary-700 mb-2">Michelin</div>
                <div className="text-sm text-secondary-600">Star Restaurant</div>
              </div>
              <div className="card-gradient p-6 text-center">
                <div className="text-2xl font-display font-bold text-primary-700 mb-2">James Beard</div>
                <div className="text-sm text-secondary-600">Nominee</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Modern Portfolio Section
const PortfolioSection = () => {
  const dishes = [
    {
      id: 1,
      title: "Seared Scallops",
      description: "Pan-seared diver scallops with cauliflower purée and crispy pancetta",
      category: "Seafood",
      difficulty: "Advanced",
    },
    {
      id: 2,
      title: "Wagyu Beef Tenderloin",
      description: "Japanese A5 wagyu with truffle jus and roasted root vegetables",
      category: "Meat",
      difficulty: "Expert",
    },
    {
      id: 3,
      title: "Lobster Bisque",
      description: "Classic French bisque with cognac cream and chive oil",
      category: "Soup",
      difficulty: "Advanced",
    },
    {
      id: 4,
      title: "Chocolate Soufflé",
      description: "Dark chocolate soufflé with raspberry coulis and gold leaf",
      category: "Dessert",
      difficulty: "Expert",
    },
    {
      id: 5,
      title: "Duck Confit",
      description: "Traditional duck leg confit with cherry gastrique",
      category: "Meat",
      difficulty: "Advanced",
    },
    {
      id: 6,
      title: "Tuna Tartare",
      description: "Yellowfin tuna with avocado mousse and sesame tuile",
      category: "Seafood",
      difficulty: "Intermediate",
    },
  ];

  return (
    <section id="portfolio" className="section bg-primary-50">
      <div className="section-container">
        <div className="section-header">
          <div className="badge-primary mb-4">Portfolio</div>
          <h2 className="heading-2 mb-6">Signature Creations</h2>
          <p className="body-large max-w-3xl mx-auto">
            Discover a curated selection of my most celebrated dishes, each crafted with 
            precision, passion, and the finest ingredients available.
          </p>
        </div>

        <div className="grid-responsive">
          {dishes.map((dish, index) => (
            <div
              key={dish.id}
              className={`card-hover group animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-primary-200 to-primary-300 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-primary-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 002.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <p className="text-primary-700 font-medium">{dish.title}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="heading-3 text-lg group-hover:text-primary-600 transition-colors">
                    {dish.title}
                  </h3>
                  <span className={`badge ${
                    dish.difficulty === 'Expert' ? 'badge-accent' :
                    dish.difficulty === 'Advanced' ? 'badge-primary' : 'badge-secondary'
                  }`}>
                    {dish.difficulty}
                  </span>
                </div>
                
                <p className="body-base text-sm mb-4">{dish.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="badge-secondary text-xs">{dish.category}</span>
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors">
                    View Recipe →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="btn-primary btn-lg">View Full Portfolio</button>
        </div>
      </div>
    </section>
  );
};

// Modern Contact Section
const ContactSection = () => {
  return (
    <section id="contact" className="section bg-secondary-900">
      <div className="section-container">
        <div className="grid-feature gap-12">
          {/* Content */}
          <div className="text-white">
            <div className="badge-accent mb-4">Get in Touch</div>
            <h2 className="heading-2 text-white mb-6">Let&apos;s Create Something Extraordinary</h2>
            <p className="body-large text-white/80 mb-8">
              Ready to elevate your culinary experience? Whether you&apos;re planning an intimate 
              dinner party or a grand celebration, I&apos;d love to bring my passion for exceptional 
              cuisine to your table.
            </p>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-white">Email</div>
                  <div className="text-white/70">chef@alexandrachen.com</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-white">Phone</div>
                  <div className="text-white/70">+1 (555) 123-4567</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-white">Location</div>
                  <div className="text-white/70">San Francisco, CA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card glass p-8">
            <h3 className="heading-3 text-lg mb-6">Send a Message</h3>
            <ClientContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};

// Modern Footer
const Footer = () => {
  return (
    <footer className="bg-secondary-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold">AC</span>
            </div>
            <span className="font-display font-semibold text-xl">Alexandra Chen</span>
          </div>
          
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            Crafting extraordinary culinary experiences with passion, innovation, and artistic excellence.
          </p>

          <div className="flex justify-center space-x-6 mb-8">
            <Link href="#" className="text-white/70 hover:text-primary-400 transition-colors">
              Instagram
            </Link>
            <Link href="#" className="text-white/70 hover:text-primary-400 transition-colors">
              LinkedIn
            </Link>
            <Link href="#" className="text-white/70 hover:text-primary-400 transition-colors">
              Twitter
            </Link>
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="text-white/50 text-sm">
              © 2025 Alexandra Chen. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Page Component
export default function Page() {
  return (
    <div className="min-h-screen font-sans">
      <ModernNavigation />
      <HeroSection />
      <AboutSection />
      <PortfolioSection />
      <ContactSection />
      <Footer />
    </div>

  );
}
