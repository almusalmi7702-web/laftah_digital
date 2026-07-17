import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from 'react';
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
  const [controlsVisible, setControlsVisible] = useState(false);

  const touchStartRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const didSwipeRef = useRef(false);
  const hideControlsTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    setFailedImages([]);
  }, [imagesKey]);

  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current !== null) {
        window.clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

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
      setActiveIndex((current) => {
        const currentIndex = Math.min(
          current,
          visibleImages.length - 1,
        );

        return currentIndex >= visibleImages.length - 1
          ? 0
          : currentIndex + 1;
      });
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeIndex, hasMultipleImages, visibleImages.length]);

  const clearControlsTimeout = () => {
    if (hideControlsTimeoutRef.current !== null) {
      window.clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
  };

  const showControls = () => {
    clearControlsTimeout();
    setControlsVisible(true);
  };

  const hideControls = () => {
    clearControlsTimeout();
    setControlsVisible(false);
  };

  const showControlsTemporarily = () => {
    clearControlsTimeout();
    setControlsVisible(true);

    hideControlsTimeoutRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      hideControlsTimeoutRef.current = null;
    }, 2500);
  };

  const goToPreviousImage = () => {
    setActiveIndex((current) => {
      if (visibleImages.length === 0) return 0;

      const currentIndex = Math.min(
        current,
        visibleImages.length - 1,
      );

      return currentIndex === 0
        ? visibleImages.length - 1
        : currentIndex - 1;
    });
  };

  const goToNextImage = () => {
    setActiveIndex((current) => {
      if (visibleImages.length === 0) return 0;

      const currentIndex = Math.min(
        current,
        visibleImages.length - 1,
      );

      return currentIndex >= visibleImages.length - 1
        ? 0
        : currentIndex + 1;
    });
  };

  const stopLinkNavigation = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const showPrevious = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    stopLinkNavigation(event);
    goToPreviousImage();
    showControlsTemporarily();
  };

  const showNext = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    stopLinkNavigation(event);
    goToNextImage();
    showControlsTemporarily();
  };

  const showImage = (
    event: MouseEvent<HTMLButtonElement>,
    index: number,
  ) => {
    stopLinkNavigation(event);
    setActiveIndex(index);
    showControlsTemporarily();
  };

  const handleTouchStart = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    const touch = event.touches[0];

    if (!touch) return;

    didSwipeRef.current = false;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    showControlsTemporarily();
  };

  const handleTouchMove = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    const touchStart = touchStartRef.current;
    const touch = event.touches[0];

    if (!touchStart || !touch) return;

    const horizontalDistance = touch.clientX - touchStart.x;
    const verticalDistance = touch.clientY - touchStart.y;

    if (
      Math.abs(horizontalDistance) > 10 &&
      Math.abs(horizontalDistance) >
        Math.abs(verticalDistance)
    ) {
      event.preventDefault();
    }
  };

  const handleTouchEnd = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    const touchStart = touchStartRef.current;
    const touch = event.changedTouches[0];

    touchStartRef.current = null;

    if (!touchStart || !touch || !hasMultipleImages) return;

    const horizontalDistance = touch.clientX - touchStart.x;
    const verticalDistance = touch.clientY - touchStart.y;

    const isHorizontalSwipe =
      Math.abs(horizontalDistance) >= 50 &&
      Math.abs(horizontalDistance) >
        Math.abs(verticalDistance);

    if (!isHorizontalSwipe) return;

    didSwipeRef.current = true;

    event.preventDefault();
    event.stopPropagation();

    if (horizontalDistance < 0) {
      goToNextImage();
    } else {
      goToPreviousImage();
    }

    showControlsTemporarily();
  };

  const preventLinkAfterSwipe = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (!didSwipeRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    didSwipeRef.current = false;
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

  const controlsVisibilityClass = controlsVisible
    ? 'pointer-events-auto opacity-100'
    : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100';

  return (
    <div
      className={`group relative w-full h-full overflow-hidden bg-theme-muted touch-pan-y select-none ${className}`}
      onMouseEnter={showControls}
      onMouseLeave={hideControls}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClickCapture={preventLinkAfterSwipe}
    >
      <img
        key={currentImage}
        src={currentImage}
        alt={alt}
        draggable={false}
        className={`w-full h-full object-cover ${imageClassName}`}
        onError={() => markImageAsFailed(currentImage)}
      />

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="الصورة السابقة"
            className={`absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all duration-200 hover:bg-black/70 ${controlsVisibilityClass}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={showNext}
            aria-label="الصورة التالية"
            className={`absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all duration-200 hover:bg-black/70 ${controlsVisibilityClass}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            className={`absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/40 px-3 py-2 transition-opacity duration-200 ${controlsVisibilityClass}`}
          >
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

export default ServiceImageSlider;        <ImagePlaceholder />
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
