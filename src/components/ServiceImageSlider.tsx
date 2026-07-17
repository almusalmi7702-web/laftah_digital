import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
  type TransitionEvent,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ImagePlaceholder from './ImagePlaceholder';

interface ServiceImageSliderProps {
  images?: string[] | null;
  alt: string;
  className?: string;
  imageClassName?: string;
}

const AUTO_PLAY_DELAY = 4000;
const SLIDE_DURATION = 480;
const MOBILE_CONTROLS_HIDE_DELAY = 600;

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
  const [trackIndex, setTrackIndex] = useState(
    normalizedImages.length > 1 ? 1 : 0,
  );
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isSliding, setIsSliding] = useState(false);

  const touchStartRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const didSwipeRef = useRef(false);
  const hideControlsTimeoutRef = useRef<number | null>(null);
  const transitionFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    setFailedImages([]);
  }, [imagesKey]);

  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current !== null) {
        window.clearTimeout(hideControlsTimeoutRef.current);
      }

      if (transitionFrameRef.current !== null) {
        window.cancelAnimationFrame(transitionFrameRef.current);
      }
    };
  }, []);

  const visibleImages = normalizedImages.filter(
    (image) => !failedImages.includes(image),
  );

  const visibleImagesKey = visibleImages.join('|');
  const hasMultipleImages = visibleImages.length > 1;

  const safeIndex = Math.min(
    activeIndex,
    Math.max(visibleImages.length - 1, 0),
  );

  const currentImage = visibleImages[safeIndex];

  useEffect(() => {
    setActiveIndex(0);
    setTrackIndex(visibleImages.length > 1 ? 1 : 0);
    setTransitionEnabled(false);
    setIsSliding(false);

    if (transitionFrameRef.current !== null) {
      window.cancelAnimationFrame(transitionFrameRef.current);
    }

    transitionFrameRef.current = window.requestAnimationFrame(() => {
      transitionFrameRef.current = window.requestAnimationFrame(() => {
        setTransitionEnabled(true);
        transitionFrameRef.current = null;
      });
    });
  }, [visibleImagesKey, visibleImages.length]);

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

  const hideControlsQuickly = () => {
    clearControlsTimeout();

    hideControlsTimeoutRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      hideControlsTimeoutRef.current = null;
    }, MOBILE_CONTROLS_HIDE_DELAY);
  };

  const moveBy = useCallback(
    (direction: -1 | 1) => {
      if (!hasMultipleImages || isSliding) return;

      setTransitionEnabled(true);
      setIsSliding(true);

      setActiveIndex((current) => {
        const currentIndex = Math.min(
          current,
          visibleImages.length - 1,
        );

        if (direction === 1) {
          return currentIndex >= visibleImages.length - 1
            ? 0
            : currentIndex + 1;
        }

        return currentIndex === 0
          ? visibleImages.length - 1
          : currentIndex - 1;
      });

      setTrackIndex((current) => current + direction);
    },
    [hasMultipleImages, isSliding, visibleImages.length],
  );

  useEffect(() => {
    if (!hasMultipleImages || isSliding) return;

    const timeoutId = window.setTimeout(() => {
      moveBy(1);
    }, AUTO_PLAY_DELAY);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    activeIndex,
    hasMultipleImages,
    isSliding,
    moveBy,
  ]);

  const resetTrackWithoutAnimation = (newTrackIndex: number) => {
    setTransitionEnabled(false);
    setTrackIndex(newTrackIndex);

    if (transitionFrameRef.current !== null) {
      window.cancelAnimationFrame(transitionFrameRef.current);
    }

    transitionFrameRef.current = window.requestAnimationFrame(() => {
      transitionFrameRef.current = window.requestAnimationFrame(() => {
        setTransitionEnabled(true);
        setIsSliding(false);
        transitionFrameRef.current = null;
      });
    });
  };

  const handleTrackTransitionEnd = (
    event: TransitionEvent<HTMLDivElement>,
  ) => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== 'transform'
    ) {
      return;
    }

    if (trackIndex === 0) {
      resetTrackWithoutAnimation(visibleImages.length);
      return;
    }

    if (trackIndex === visibleImages.length + 1) {
      resetTrackWithoutAnimation(1);
      return;
    }

    setIsSliding(false);
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
    moveBy(-1);
  };

  const showNext = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    stopLinkNavigation(event);
    moveBy(1);
  };

  const showImage = (
    event: MouseEvent<HTMLButtonElement>,
    index: number,
  ) => {
    stopLinkNavigation(event);

    if (
      !hasMultipleImages ||
      isSliding ||
      index === safeIndex
    ) {
      return;
    }

    setTransitionEnabled(true);
    setIsSliding(true);
    setActiveIndex(index);
    setTrackIndex(index + 1);
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

    showControls();
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
    hideControlsQuickly();

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
      moveBy(1);
    } else {
      moveBy(-1);
    }
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
    didSwipeRef.current = false;
    hideControlsQuickly();
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

  const sliderImages = hasMultipleImages
    ? [
        visibleImages[visibleImages.length - 1]!,
        ...visibleImages,
        visibleImages[0]!,
      ]
    : visibleImages;

  const controlsVisibilityClass = controlsVisible
    ? 'pointer-events-auto opacity-100'
    : 'pointer-events-none opacity-0';

  return (
    <div
      className={`group relative w-full h-full overflow-hidden bg-theme-muted touch-pan-y select-none ${className}`}
      onMouseEnter={showControls}
      onMouseLeave={hideControls}
      onFocusCapture={showControls}
      onBlurCapture={hideControls}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClickCapture={preventLinkAfterSwipe}
    >
      <div
        dir="ltr"
        className="flex h-full w-full"
        style={{
          transform: `translate3d(-${trackIndex * 100}%, 0, 0)`,
          transition: transitionEnabled
            ? `transform ${SLIDE_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`
            : 'none',
          willChange: 'transform',
        }}
        onTransitionEnd={handleTrackTransitionEnd}
      >
        {sliderImages.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="h-full w-full min-w-full shrink-0"
          >
            <img
              src={image}
              alt={alt}
              draggable={false}
              className={`w-full h-full object-cover ${imageClassName}`}
              onError={() => markImageAsFailed(image)}
            />
          </div>
        ))}
      </div>

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="الصورة السابقة"
            className={`absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all duration-150 hover:bg-black/70 ${controlsVisibilityClass}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={showNext}
            aria-label="الصورة التالية"
            className={`absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-all duration-150 hover:bg-black/70 ${controlsVisibilityClass}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            className={`absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/40 px-3 py-2 transition-opacity duration-150 ${controlsVisibilityClass}`}
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

export default ServiceImageSlider;
