'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: {
    src: string;
    alt: string;
  };
  ctaButton?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  chef?: {
    name: string;
    title: string;
    image?: string;
  };
  className?: string;
  variant?: 'minimal' | 'chef' | 'dish' | 'full';
  overlay?: 'dark' | 'light' | 'gradient' | 'none';
  height?: 'screen' | 'large' | 'medium' | 'small';
  scrollIndicator?: boolean;
}

export default function HeroSection({
  title,
  subtitle,
  description,
  backgroundImage,
  ctaButton,
  chef,
  className = '',
  variant = 'minimal',
  overlay = 'dark',
  height = 'screen',
  scrollIndicator = true
}: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getHeightClasses = () => {
    switch (height) {
      case 'large': return 'h-[80vh] min-h-[600px]';
      case 'medium': return 'h-[60vh] min-h-[400px]';
      case 'small': return 'h-[40vh] min-h-[300px]';
      default: return 'h-screen min-h-[100vh]';
    }
  };

  const getOverlayClasses = () => {
    switch (overlay) {
      case 'light':
        return 'bg-white/60 backdrop-blur-sm';
      case 'gradient':
        return 'bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent';
      case 'none':
        return '';
      default:
        return 'bg-stone-900/50 backdrop-blur-sm';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };

  const renderChefVariant = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
      {/* Chef Image */}
      <motion.div 
        className="relative order-2 lg:order-1"
        variants={itemVariants}
      >
        {chef?.image ? (
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
            <Image
              src={chef.image}
              alt={chef.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="aspect-[3/4] bg-stone-200 rounded-lg flex items-center justify-center">
            <span className="text-stone-400">Chef Photo</span>
          </div>
        )}
      </motion.div>

      {/* Chef Content */}
      <motion.div 
        className="text-center lg:text-left order-1 lg:order-2"
        variants={itemVariants}
      >
        {subtitle && (
          <motion.p 
            className="text-lg text-stone-300 mb-4 font-light tracking-wide"
            variants={itemVariants}
          >
            {subtitle}
          </motion.p>
        )}
        
        <motion.h1 
          className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight"
          variants={itemVariants}
        >
          {title}
        </motion.h1>

        {chef && (
          <motion.div className="mb-6" variants={itemVariants}>
            <h2 className="text-2xl text-stone-200 font-medium">{chef.name}</h2>
            <p className="text-stone-400">{chef.title}</p>
          </motion.div>
        )}

        {description && (
          <motion.p 
            className="text-xl text-stone-300 mb-8 leading-relaxed max-w-xl"
            variants={itemVariants}
          >
            {description}
          </motion.p>
        )}

        {ctaButton && (
          <motion.div variants={itemVariants}>
            <a
              href={ctaButton.href}
              onClick={ctaButton.onClick}
              className="inline-block px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-stone-900 transition-all duration-300 text-lg font-medium tracking-wide group"
            >
              {ctaButton.text}
              <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );

  const renderMinimalVariant = () => (
    <motion.div 
      className="text-center max-w-4xl mx-auto"
      variants={containerVariants}
    >
      {subtitle && (
        <motion.p 
          className="text-lg md:text-xl text-stone-300 mb-6 font-light tracking-wide"
          variants={itemVariants}
        >
          {subtitle}
        </motion.p>
      )}
      
      <motion.h1 
        className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-white mb-8 leading-tight tracking-wide"
        variants={itemVariants}
      >
        {title}
      </motion.h1>

      {description && (
        <motion.p 
          className="text-xl md:text-2xl text-stone-300 mb-12 leading-relaxed max-w-3xl mx-auto"
          variants={itemVariants}
        >
          {description}
        </motion.p>
      )}

      {ctaButton && (
        <motion.div variants={itemVariants}>
          <a
            href={ctaButton.href}
            onClick={ctaButton.onClick}
            className="inline-block px-10 py-4 border-2 border-white text-white hover:bg-white hover:text-stone-900 transition-all duration-300 text-lg font-medium tracking-wide group"
          >
            {ctaButton.text}
            <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </a>
        </motion.div>
      )}
    </motion.div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'chef':
        return renderChefVariant();
      default:
        return renderMinimalVariant();
    }
  };

  return (
    <section 
      className={`
        relative ${getHeightClasses()} 
        flex items-center justify-center
        overflow-hidden
        ${className}
      `}
    >
      {/* Background */}
      {backgroundImage ? (
        <>
          <Image
            src={backgroundImage.src}
            alt={backgroundImage.alt}
            fill
            className={`
              object-cover transition-opacity duration-1000
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            style={{
              transform: `translateY(${scrollY * 0.5}px)` // Parallax effect
            }}
            priority
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Overlay */}
          <div className={`absolute inset-0 ${getOverlayClasses()}`} />
        </>
      ) : (
        /* Gradient Background */
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" />
      )}

      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-6 w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {renderContent()}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      {scrollIndicator && (
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center cursor-pointer hover:text-white transition-colors"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="text-sm mb-2 tracking-wide">Scroll to explore</span>
            <ChevronDownIcon className="h-6 w-6" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
