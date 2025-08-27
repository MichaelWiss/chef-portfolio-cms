
// NEW DESIGN SYSTEM LANDING PAGE
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Client-only contact form to avoid hydration issues
function ContactForm() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render a simple placeholder div during SSR - no form inputs at all
    return (
      <div className="space-y-6">
        <div className="w-full px-6 py-4 rounded-lg border border-sage bg-cream text-charcoal h-14 flex items-center">
          <span className="text-sage">Your Name</span>
        </div>
        <div className="w-full px-6 py-4 rounded-lg border border-sage bg-cream text-charcoal h-14 flex items-center">
          <span className="text-sage">Your Email</span>
        </div>
        <div className="w-full px-6 py-4 rounded-lg border border-sage bg-cream text-charcoal h-32 flex items-start pt-4">
          <span className="text-sage">Message</span>
        </div>
        <div className="w-full py-4 rounded-lg bg-terracotta text-white font-semibold text-lg shadow text-center">
          Send Message
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6">
      <div>
        <input 
          type="text" 
          placeholder="Your Name" 
          className="w-full px-6 py-4 rounded-lg border border-sage bg-cream text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta" 
          autoComplete="name"
        />
      </div>
      <div>
        <input 
          type="email" 
          placeholder="Your Email" 
          className="w-full px-6 py-4 rounded-lg border border-sage bg-cream text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta" 
          autoComplete="email"
        />
      </div>
      <div>
        <textarea 
          placeholder="Message" 
          rows={5} 
          className="w-full px-6 py-4 rounded-lg border border-sage bg-cream text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta" 
          autoComplete="off"
        />
      </div>
      <button type="submit" className="w-full py-4 rounded-lg bg-terracotta text-white font-semibold text-lg shadow hover:bg-charcoal transition-colors">
        Send Message
      </button>
    </form>
  );
}

export default function DesignSystemLanding() {
  return (
    <main className="min-h-screen bg-cream font-sans text-charcoal">
      {/* Navigation */}
      <nav className="w-full px-8 py-6 flex justify-between items-center bg-sage shadow-md">
        <Link href="/" className="font-serif text-2xl text-charcoal tracking-wide">Chef Portfolio</Link>
        <ul className="flex gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-lg text-charcoal hover:text-terracotta transition-colors font-medium">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center h-[80vh] bg-gradient-to-br from-cream via-pale-rose to-sage text-charcoal">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: `url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'#7D7461\' fill-opacity=\'0.08\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`}}></div>
        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
          <h1 className="font-serif text-6xl md:text-7xl font-light tracking-wide mb-4">A New Standard in Culinary Portfolio</h1>
          <p className="text-xl md:text-2xl text-deep-forest max-w-2xl mx-auto leading-relaxed">
            Showcase your culinary artistry with a design system inspired by fine dining and crafted for digital excellence.
          </p>
          <div className="pt-8">
            <Link href="#about" className="inline-block px-10 py-4 border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-300 text-lg font-medium tracking-wide rounded-full shadow-lg">Learn More</Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-charcoal/60 animate-bounce">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light text-charcoal mb-6">About the Design System</h2>
          <p className="text-xl text-deep-forest max-w-2xl mx-auto leading-relaxed">
            This system blends sophisticated color palettes, elegant typography, and modern layouts to elevate chef portfolios to a new level of professionalism and beauty.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-cream rounded-lg shadow flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 bg-terracotta rounded-full"></div>
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-4">Refined Aesthetics</h3>
            <p className="text-deep-forest leading-relaxed">Clean lines, luxurious colors, and thoughtful spacing create a sense of quality and sophistication.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-cream rounded-lg shadow flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 bg-sage rounded-full"></div>
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-4">Functional Design</h3>
            <p className="text-deep-forest leading-relaxed">Intuitive navigation and interactive elements make browsing effortless and engaging.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-cream rounded-lg shadow flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 bg-pale-rose rounded-full"></div>
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-4">Artistry</h3>
            <p className="text-deep-forest leading-relaxed">Beautiful animations and details enhance the storytelling of culinary creations.</p>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light text-charcoal mb-6">Portfolio Highlights</h2>
          <p className="text-xl text-deep-forest max-w-2xl mx-auto leading-relaxed">Signature dishes and culinary moments, presented with elegance and clarity.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Example Portfolio Cards */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <Image src="/images/duck-breast.jpg" alt="Seared Duck Breast" width={400} height={192} className="w-full h-48 object-cover rounded-lg mb-4" />
            <h4 className="font-serif text-2xl text-charcoal mb-2">Seared Duck Breast</h4>
            <p className="text-deep-forest text-base mb-2">Pan-seared duck breast with cherry gastrique, roasted fingerling potatoes, and seasonal vegetables.</p>
            <span className="text-sm text-terracotta font-medium">Chef Alexandra Chen</span>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <Image src="/images/chocolate-souffle.jpg" alt="Chocolate Soufflé" width={400} height={192} className="w-full h-48 object-cover rounded-lg mb-4" />
            <h4 className="font-serif text-2xl text-charcoal mb-2">Chocolate Soufflé</h4>
            <p className="text-deep-forest text-base mb-2">Rich dark chocolate soufflé with vanilla bean crème anglaise and fresh berry compote.</p>
            <span className="text-sm text-terracotta font-medium">Chef Alexandra Chen</span>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <Image src="/images/burrata-peach.jpg" alt="Burrata & Peach" width={400} height={192} className="w-full h-48 object-cover rounded-lg mb-4" />
            <h4 className="font-serif text-2xl text-charcoal mb-2">Burrata & Peach</h4>
            <p className="text-deep-forest text-base mb-2">Fresh burrata with grilled peaches, arugula, prosciutto, and honey-balsamic reduction.</p>
            <span className="text-sm text-terracotta font-medium">Chef Alexandra Chen</span>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-light text-charcoal mb-6">Contact</h2>
          <p className="text-xl text-deep-forest max-w-xl mx-auto leading-relaxed">Get in touch to collaborate or inquire about portfolio opportunities.</p>
        </div>
        <ContactForm />
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-cream py-16 px-6 mt-24">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="font-serif text-2xl font-light mb-4">Chef Portfolio Design System</h3>
            <p className="text-sage max-w-md mx-auto">Crafting exceptional digital experiences with the same precision found in fine dining.</p>
          </div>
          <div className="flex justify-center space-x-6 mb-8">
            <Link href="/" className="text-sage hover:text-terracotta transition-colors">Home</Link>
            <Link href="/portfolio" className="text-sage hover:text-terracotta transition-colors">Portfolio</Link>
            <Link href="/about" className="text-sage hover:text-terracotta transition-colors">About</Link>
          </div>
          <p className="text-sage text-sm">© 2025 Chef Portfolio Design System. Crafted with passion for culinary excellence.</p>
        </div>
      </footer>
    </main>
  );
}
