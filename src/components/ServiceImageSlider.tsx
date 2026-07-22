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
const PRELOAD_MAX_WAIT = 5000;

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
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<-1 | 1 | null>(
    null,
  );
  const [trackOffset, setTrackOffset] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isSliding, setIsSliding] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [isInViewport, setIsInViewport] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const touchStartRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const activeIndexRef = useRef(0);
  const isSlidingRef = useRef(false);
  const didSwipeRef = useRef(false);
  const loadTokenRef = useRef(0);

  const hideControlsTimeoutRef = useRef<number | null>(null);
  const preloadTimeoutRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const finishSlideRef = useRef<(() => void) | null>(null);

  const hasMultipleImages = normalizedImages.length > 1;

  const safeIndex = Math.min(
    activeIndex,
    Math.max(normalizedImages.length - 1, 0),
  );

  const currentImage = normalizedImages[safeIndex];

  useEffect(() => {
    activeIndexRef.current = safeIndex;
  }, [safeIndex]);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(
          entry.isIntersecting || entry.intersectionRatio > 0,
        );
      },
      {
        threshold: 0.1,
        rootMargin: '150px 0px',
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    loadTokenRef.current += 1;
    activeIndexRef.current = 0;
    isSlidingRef.current = false;
    finishSlideRef.current = null;

    setActiveIndex(0);
    setTargetIndex(null);
    setSlideDirection(null);
    setTrackOffset(0);
    setTransitionEnabled(true);
    setIsSliding(false);
    setFailedImages([]);

    if (preloadTimeoutRef.current !== null) {
      window.clearTimeout(preloadTimeoutRef.current);
      preloadTimeoutRef.current = null;
    }

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [imagesKey]);

  useEffect(() => {
    return () => {
      loadTokenRef.current += 1;
      finishSlideRef.current = null;

      if (hideControlsTimeoutRef.current !== null) {
        window.clearTimeout(hideControlsTimeoutRef.current);
      }

      if (preloadTimeoutRef.current !== null) {
        window.clearTimeout(preloadTimeoutRef.current);
      }

      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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

  const markImageAsFailed = useCallback((imageUrl: string) => {
    setFailedImages((current) =>
      current.includes(imageUrl)
        ? current
        : [...current, imageUrl],
    );
  }, []);

  const startTransitionTo = useCallback(
    (nextIndex: number, direction: -1 | 1) => {
      if (
        normalizedImages.length < 2 ||
        nextIndex < 0 ||
        nextIndex >= normalizedImages.length ||
        nextIndex === activeIndexRef.current ||
        isSlidingRef.current
      ) {
        return;
      }

      const targetImage = normalizedImages[nextIndex];

      if (!targetImage) return;

      const transitionToken = loadTokenRef.current + 1;
      loadTokenRef.current = transitionToken;

      isSlidingRef.current = true;
      setIsSliding(true);

      let transitionStarted = false;

      const finishTransition = () => {
        if (loadTokenRef.current !== transitionToken) return;

        if (transitionTimeoutRef.current !== null) {
          window.clearTimeout(transitionTimeoutRef.current);
          transitionTimeoutRef.current = null;
        }

        activeIndexRef.current = nextIndex;
        isSlidingRef.current = false;
        finishSlideRef.current = null;

        setActiveIndex(nextIndex);
        setTargetIndex(null);
        setSlideDirection(null);
        setTrackOffset(0);
        setTransitionEnabled(false);
        setIsSliding(false);

        if (animationFrameRef.current !== null) {
          window.cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = window.requestAnimationFrame(() => {
          setTransitionEnabled(true);
          animationFrameRef.current = null;
        });
      };

      const beginTransition = () => {
        if (
          transitionStarted ||
          loadTokenRef.current !== transitionToken
        ) {
          return;
        }

        transitionStarted = true;

        if (preloadTimeoutRef.current !== null) {
          window.clearTimeout(preloadTimeoutRef.current);
          preloadTimeoutRef.current = null;
        }

        finishSlideRef.current = finishTransition;

        setTargetIndex(nextIndex);
        setSlideDirection(direction);
        setTransitionEnabled(false);
        setTrackOffset(direction === 1 ? 0 : -100);

        if (animationFrameRef.current !== null) {
          window.cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = window.requestAnimationFrame(() => {
          animationFrameRef.current =
            window.requestAnimationFrame(() => {
              if (loadTokenRef.current !== transitionToken) return;

              setTransitionEnabled(true);
              setTrackOffset(direction === 1 ? -100 : 0);

              transitionTimeoutRef.current = window.setTimeout(
                finishTransition,
                SLIDE_DURATION + 200,
              );

              animationFrameRef.current = null;
            });
        });
      };

      if (failedImages.includes(targetImage)) {
        beginTransition();
        return;
      }

      const imageLoader = new window.Image();

      imageLoader.onload = beginTransition;

      imageLoader.onerror = () => {
        markImageAsFailed(targetImage);
        beginTransition();
      };

      preloadTimeoutRef.current = window.setTimeout(
        beginTransition,
        PRELOAD_MAX_WAIT,
      );

      imageLoader.src = targetImage;

      if (imageLoader.complete) {
        beginTransition();
      }
    },
    [failedImages, markImageAsFailed, normalizedImages],
  );

  const moveBy = useCallback(
    (direction: -1 | 1) => {
      if (normalizedImages.length < 2) return;

      const currentIndex = activeIndexRef.current;

      const nextIndex =
        direction === 1
          ? (currentIndex + 1) % normalizedImages.length
          : (currentIndex - 1 + normalizedImages.length) %
            normalizedImages.length;

      startTransitionTo(nextIndex, direction);
    },
    [normalizedImages.length, startTransitionTo],
  );

  useEffect(() => {
    if (
      !hasMultipleImages ||
      !isInViewport ||
      isSliding ||
      typeof document === 'undefined' ||
      document.visibilityState !== 'visible'
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      moveBy(1);
    }, AUTO_PLAY_DELAY);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    activeIndex,
    hasMultipleImages,
    isInViewport,
    isSliding,
    moveBy,
  ]);

  const handleTrackTransitionEnd = (
    event: TransitionEvent<HTMLDivElement>,
  ) => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== 'transform'
    ) {
      return;
    }

    finishSlideRef.current?.();
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

    const currentIndex = activeIndexRef.current;

    if (
      index === currentIndex ||
      isSlidingRef.current ||
      normalizedImages.length < 2
    ) {
      return;
    }

    const forwardDistance =
      (index - currentIndex + normalizedImages.length) %
      normalizedImages.length;

    const backwardDistance =
      (currentIndex - index + normalizedImages.length) %
      normalizedImages.length;

    const direction: -1 | 1 =
      forwardDistance <= backwardDistance ? 1 : -1;

    startTransitionTo(index, direction);
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

  if (!currentImage) {
    return (
      <div className={`w-full h-full ${className}`}>
        <ImagePlaceholder />
      </div>
    );
  }

  const targetImage =
    targetIndex !== null
      ? normalizedImages[targetIndex]
      : undefined;

  const slidingImages =
    isSliding && targetImage && slideDirection
      ? slideDirection === 1
        ? [currentImage, targetImage]
        : [targetImage, currentImage]
      : [];

  const controlsVisibilityClass = controlsVisible
    ? 'pointer-events-auto opacity-100'
    : 'pointer-events-none opacity-0';

  const renderSlide = (
    imageUrl: string,
    key: string,
  ) => (
    <div
      key={key}
      className="h-full w-full min-w-full shrink-0"
    >
      {failedImages.includes(imageUrl) ? (
        <ImagePlaceholder />
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={`w-full h-full object-cover ${imageClassName}`}
          onError={() => markImageAsFailed(imageUrl)}
        />
      )}
    </div>
  );

  return (
    <div
      ref={containerRef}
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
      {slidingImages.length === 2 ? (
        <div
          dir="ltr"
          className="flex h-full w-full"
          style={{
            transform: `translate3d(${trackOffset}%, 0, 0)`,
            transition: transitionEnabled
              ? `transform ${SLIDE_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`
              : 'none',
          }}
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {slidingImages.map((imageUrl, index) =>
            renderSlide(
              imageUrl,
              `${imageUrl}-${slideDirection}-${index}`,
            ),
          )}
        </div>
      ) : (
        <div className="h-full w-full">
          {renderSlide(currentImage, currentImage)}
        </div>
      )}

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
            dir="ltr"
            className={`absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/40 px-3 py-2 transition-opacity duration-150 ${controlsVisibilityClass}`}
          >
            {normalizedImages.map((imageUrl, index) => (
              <button
                key={imageUrl}
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
