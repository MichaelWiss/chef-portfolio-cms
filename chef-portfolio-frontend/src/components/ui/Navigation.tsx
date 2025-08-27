'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavigationLink {
  label: string;
  href: string;
  isActive?: boolean;
  isExternal?: boolean;
}

interface NavigationProps {
  logo?: {
    text?: string;
    image?: string;
    href?: string;
  };
  links: NavigationLink[];
  className?: string;
  variant?: 'transparent' | 'solid' | 'blur' | 'minimal';
  position?: 'fixed' | 'absolute' | 'sticky' | 'relative';
  darkMode?: boolean;
  scrollEffect?: boolean;
  hideOnScroll?: boolean;
}

export default function Navigation({
  logo = { text: 'Chef', href: '/' },
  links,
  className = '',
  variant = 'transparent',
  position = 'fixed',
  darkMode = false,
  scrollEffect = true,
  hideOnScroll = false
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (scrollEffect) {
        setScrolled(currentScrollY > 50);
      }
      
      if (hideOnScroll) {
        setShouldHide(currentScrollY > lastScrollY && currentScrollY > 100);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, scrollEffect, hideOnScroll]);

  const getNavStyles = () => {
    const baseClasses = `
      w-full z-50 transition-all duration-300
      ${position === 'fixed' ? 'fixed top-0' : ''}
      ${position === 'absolute' ? 'absolute top-0' : ''}
      ${position === 'sticky' ? 'sticky top-0' : ''}
      ${shouldHide ? 'transform -translate-y-full' : 'transform translate-y-0'}
    `;

    switch (variant) {
      case 'solid':
        return `${baseClasses} ${
          scrolled || isOpen
            ? darkMode
              ? 'bg-stone-900 shadow-lg'
              : 'bg-white shadow-lg'
            : darkMode
            ? 'bg-stone-900/50'
            : 'bg-white/50'
        }`;
      
      case 'blur':
        return `${baseClasses} ${
          scrolled || isOpen
            ? darkMode
              ? 'bg-stone-900/90 backdrop-blur-md shadow-lg'
              : 'bg-white/90 backdrop-blur-md shadow-lg'
            : darkMode
            ? 'bg-stone-900/30 backdrop-blur-sm'
            : 'bg-white/30 backdrop-blur-sm'
        }`;
      
      case 'minimal':
        return `${baseClasses} ${
          darkMode ? 'bg-transparent' : 'bg-transparent'
        }`;
      
      default: // transparent
        return `${baseClasses} ${
          scrolled || isOpen
            ? darkMode
              ? 'bg-stone-900/95 backdrop-blur-sm shadow-lg'
              : 'bg-white/95 backdrop-blur-sm shadow-lg'
            : 'bg-transparent'
        }`;
    }
  };

  const getTextColor = () => {
    if (variant === 'minimal') {
      return darkMode ? 'text-white' : 'text-stone-900';
    }
    
    if (scrolled || isOpen) {
      return darkMode ? 'text-white' : 'text-stone-900';
    }
    
    return darkMode ? 'text-white' : 'text-white';
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3 }
    }
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 }
    })
  };

  return (
    <motion.nav 
      className={`${getNavStyles()} ${className}`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link href={logo.href || '/'} className="flex-shrink-0">
            <motion.div 
              className={`font-display text-2xl lg:text-3xl font-light tracking-wide ${getTextColor()}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {logo.image ? (
                <Image 
                  src={logo.image} 
                  alt="Logo" 
                  width={40}
                  height={40}
                  className="h-8 lg:h-10 w-auto"
                />
              ) : (
                logo.text
              )}
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative px-3 py-2 text-sm font-medium tracking-wide
                  transition-all duration-200 group
                  ${getTextColor()}
                  ${link.isActive ? 'text-sage-600' : ''}
                `}
                target={link.isExternal ? '_blank' : undefined}
                rel={link.isExternal ? 'noopener noreferrer' : undefined}
              >
                <span className="relative z-10">{link.label}</span>
                
                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-sage-100/20 rounded-md"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
                
                {/* Active Indicator */}
                {link.isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage-600"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md ${getTextColor()}`}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="lg:hidden overflow-hidden"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileMenuVariants}
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {links.map((link, index) => (
                  <motion.div
                    key={link.href}
                    custom={index}
                    variants={linkVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <Link
                      href={link.href}
                      className={`
                        block px-3 py-2 rounded-md text-base font-medium
                        transition-all duration-200
                        ${getTextColor()}
                        ${link.isActive 
                          ? 'bg-sage-100/20 text-sage-600' 
                          : 'hover:bg-stone-100/10'
                        }
                      `}
                      onClick={() => setIsOpen(false)}
                      target={link.isExternal ? '_blank' : undefined}
                      rel={link.isExternal ? 'noopener noreferrer' : undefined}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
