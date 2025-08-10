import React, { useState, useRef, useEffect } from 'react';
import { theme } from '../../utils/theme';

interface CarouselItem {
  id: string | number;
  content: React.ReactNode;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  itemsPerView?: number;
  gap?: number;
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  autoPlay = false,
  autoPlayInterval = 3000,
  showDots = true,
  showArrows = true,
  itemsPerView = 1,
  gap = 16,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxIndex = Math.max(0, items.length - itemsPerView);

  useEffect(() => {
    if (autoPlay && !isHovered && items.length > itemsPerView) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, isHovered, items.length, itemsPerView, maxIndex]);

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(maxIndex, index)));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const itemWidth = `calc(${100 / itemsPerView}% - ${gap * (itemsPerView - 1) / itemsPerView}px)`;
  const translateX = -(currentIndex * (100 / itemsPerView));

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="overflow-hidden"
        style={{
          borderRadius: theme.borderRadius[500],
        }}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(${translateX}%)`,
            gap: `${gap}px`,
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0"
              style={{
                width: itemWidth,
              }}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && items.length > itemsPerView && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 opacity-80 hover:opacity-100"
            style={{
              backgroundColor: theme.theme.colorPage,
              color: theme.theme.colorText,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 opacity-80 hover:opacity-100"
            style={{
              backgroundColor: theme.theme.colorPage,
              color: theme.theme.colorText,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && items.length > itemsPerView && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="w-3 h-3 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: index === currentIndex 
                  ? theme.theme.colorPrimary 
                  : theme.palette.gray[300],
              }}
            />
          ))}
        </div>
      )}

      {/* Progress Bar (when autoPlay is enabled) */}
      {autoPlay && !isHovered && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-100 ease-linear"
          style={{
            width: `${((currentIndex + 1) / (maxIndex + 1)) * 100}%`,
            backgroundColor: theme.theme.colorPrimary,
          }}
        />
      )}
    </div>
  );
};

export default Carousel;