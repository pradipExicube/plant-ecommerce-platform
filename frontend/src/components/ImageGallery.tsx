import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const allImages = images.length > 0 ? images : ['/assets/generated/product-placeholder.dim_800x800.png'];

  const prev = () => setActiveIndex(i => (i - 1 + allImages.length) % allImages.length);
  const next = () => setActiveIndex(i => (i + 1) % allImages.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
        <img
          src={allImages[activeIndex]}
          alt={`${alt} - image ${activeIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_800x800.png';
          }}
        />
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-xs hover:bg-card transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-xs hover:bg-card transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                idx === activeIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${alt} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/generated/product-placeholder.dim_800x800.png';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
