'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ShareIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface LightboxImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  chef?: string;
  date?: string;
  tags?: string[];
  rating?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  cookTime?: string;
  liked?: boolean;
}

interface LightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onLike?: (imageId: string) => void;
  onShare?: (image: LightboxImage) => void;
  className?: string;
  showMetadata?: boolean;
  enableZoom?: boolean;
  enableKeyboard?: boolean;
}

export default function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  onLike,
  onShare,
  className = '',
  showMetadata = true,
  enableZoom = true,
  enableKeyboard = true
}: LightboxProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious?.();
          break;
        case 'ArrowRight':
          onNext?.();
          break;
        case ' ':
          event.preventDefault();
          setIsZoomed(!isZoomed);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isZoomed, onClose, onNext, onPrevious, enableKeyboard]);

  useEffect(() => {
    setImageLoaded(false);
    setIsZoomed(false);
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleImageClick = () => {
    if (enableZoom) {
      setIsZoomed(!isZoomed);
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { delay: 0.1, duration: 0.3 }
    },
    exit: { opacity: 0, scale: 0.8 }
  };

  const imageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  const metadataVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.3, duration: 0.3 }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-stone-300'
        }`}
      />
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'Hard': return 'text-orange-400 bg-orange-400/10';
      case 'Expert': return 'text-red-400 bg-red-400/10';
      default: return 'text-stone-400 bg-stone-400/10';
    }
  };

  if (!isOpen || !currentImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={overlayVariants}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Content */}
        <motion.div
          className="relative w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6"
          variants={contentVariants}
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <XMarkIcon className="h-6 w-6" />
          </motion.button>

          {/* Image Container */}
          <div className="flex-1 relative flex items-center justify-center">
            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <motion.button
                  onClick={onPrevious}
                  className="absolute left-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!onPrevious}
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </motion.button>

                <motion.button
                  onClick={onNext}
                  className="absolute right-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!onNext}
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </motion.button>
              </>
            )}

            {/* Image */}
            <motion.div
              ref={imageRef}
              className={`
                relative max-w-full max-h-full cursor-pointer
                ${isZoomed ? 'transform scale-150 cursor-zoom-out' : 'cursor-zoom-in'}
              `}
              onClick={handleImageClick}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                width={1200}
                height={800}
                className={`
                  max-w-full max-h-[70vh] lg:max-h-[80vh] w-auto h-auto object-contain
                  transition-opacity duration-300
                  ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                `}
                onLoad={() => setImageLoaded(true)}
                priority
              />
              
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-800 rounded-lg">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </motion.div>

            {/* Zoom Indicator */}
            {enableZoom && (
              <motion.div
                className="absolute bottom-4 left-4 p-2 rounded-full bg-black/50 text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                transition={{ delay: 0.5 }}
              >
                {isZoomed ? (
                  <ArrowsPointingInIcon className="h-5 w-5" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                )}
              </motion.div>
            )}
          </div>

          {/* Metadata Panel */}
          {showMetadata && (
            <motion.div
              className="lg:w-80 bg-stone-900/95 backdrop-blur-sm rounded-lg p-6 overflow-y-auto max-h-[80vh]"
              variants={metadataVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  {onLike && (
                    <motion.button
                      onClick={() => onLike(currentImage.id)}
                      className="p-2 rounded-full hover:bg-stone-800 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {currentImage.liked ? (
                        <HeartSolidIcon className="h-6 w-6 text-red-500" />
                      ) : (
                        <HeartIcon className="h-6 w-6 text-stone-400" />
                      )}
                    </motion.button>
                  )}
                  
                  {onShare && (
                    <motion.button
                      onClick={() => onShare(currentImage)}
                      className="p-2 rounded-full hover:bg-stone-800 transition-colors text-stone-400"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ShareIcon className="h-6 w-6" />
                    </motion.button>
                  )}
                </div>

                <span className="text-sm text-stone-400">
                  {currentIndex + 1} of {images.length}
                </span>
              </div>

              {/* Title */}
              {currentImage.title && (
                <h2 className="text-2xl font-display font-light text-white mb-4">
                  {currentImage.title}
                </h2>
              )}

              {/* Rating */}
              {currentImage.rating && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex space-x-1">
                    {renderStars(currentImage.rating)}
                  </div>
                  <span className="text-sm text-stone-400">
                    {currentImage.rating}/5
                  </span>
                </div>
              )}

              {/* Chef & Date */}
              <div className="space-y-2 mb-4">
                {currentImage.chef && (
                  <p className="text-sm text-stone-300">
                    <span className="text-stone-500">Chef:</span> {currentImage.chef}
                  </p>
                )}
                {currentImage.date && (
                  <p className="text-sm text-stone-300">
                    <span className="text-stone-500">Date:</span> {currentImage.date}
                  </p>
                )}
                {currentImage.cookTime && (
                  <p className="text-sm text-stone-300">
                    <span className="text-stone-500">Cook Time:</span> {currentImage.cookTime}
                  </p>
                )}
              </div>

              {/* Difficulty */}
              {currentImage.difficulty && (
                <div className="mb-4">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${getDifficultyColor(currentImage.difficulty)}
                  `}>
                    {currentImage.difficulty}
                  </span>
                </div>
              )}

              {/* Description */}
              {currentImage.description && (
                <p className="text-stone-300 mb-6 leading-relaxed">
                  {currentImage.description}
                </p>
              )}

              {/* Tags */}
              {currentImage.tags && currentImage.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-stone-400 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentImage.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-stone-800 text-stone-300 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
