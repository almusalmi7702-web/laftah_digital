import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ImagePlaceholder from './ImagePlaceholder';

interface ServiceImageSliderProps {
  images?: string[] | null;
  alt: string;
  className?: string;
  imageClassName?: string;
}

const ServiceImageSlider = ({
  images,
  alt,
  className = '',
  imageClassName = '',
}: ServiceImageSliderProps) => {
  const normalizedImages = useMemo(() => {
    if (!Array.isArray(images)) return [];

    const validImages = images
      .map((image) => image?.trim())
      .filter((image): image is string => Boolean(image));

    return Array.from(new Set(validImages));
  }, [images]);

  const imagesKey = normalizedImages.join('|');

  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  useEffect(() => {
    setActiveIndex(0);
    setFailedImages([]);
  }, [imagesKey]);

  const visibleImages = normalizedImages.filter(
    (image) => !failedImages.includes(image),
  );

  const safeIndex = Math.min(
    activeIndex,
    Math.max(visibleImages.length - 1, 0),
  );

  const currentImage = visibleImages[safeIndex];
  const hasMultipleImages = visibleImages.length > 1;

  useEffect(() => {
    if (!hasMultipleImages) return;

    const timeoutId = window.setTimeout(() => {
      setActiveIndex((current) =>
        current >= visibleImages.length - 1 ? 0 : current + 1,
      );
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeIndex, hasMultipleImages, visibleImages.length]);

  const stopLinkNavigation = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const showPrevious = (event: MouseEvent<HTMLButtonElement>) => {
    stopLinkNavigation(event);

    setActiveIndex((current) =>
      current === 0 ? visibleImages.length - 1 : current - 1,
    );
  };

  const showNext = (event: MouseEvent<HTMLButtonElement>) => {
    stopLinkNavigation(event);

    setActiveIndex((current) =>
      current === visibleImages.length - 1 ? 0 : current + 1,
    );
  };

  const showImage = (
    event: MouseEvent<HTMLButtonElement>,
    index: number,
  ) => {
    stopLinkNavigation(event);
    setActiveIndex(index);
  };

  const markImageAsFailed = (imageUrl: string) => {
    setFailedImages((current) =>
      current.includes(imageUrl)
        ? current
        : [...current, imageUrl],
    );
  };

  if (!currentImage) {
    return (
      <div className={`w-full h-full ${className}`}>
        <ImagePlaceholder />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-theme-muted ${className}`}
    >
      <img
        key={currentImage}
        src={currentImage}
        alt={alt}
        className={`w-full h-full object-cover ${imageClassName}`}
        onError={() => markImageAsFailed(currentImage)}
      />

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="الصورة السابقة"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={showNext}
            aria-label="الصورة التالية"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/40 px-3 py-2">
            {visibleImages.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={(event) => showImage(event, index)}
                aria-label={`عرض الصورة ${index + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === safeIndex
                    ? 'scale-110 bg-white'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceImageSlider;
