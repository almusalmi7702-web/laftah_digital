import { useCallback, useEffect, useState } from  react ;

export const useInView = (threshold = 0.1) => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element || isInView) return;

    if (typeof IntersectionObserver ===  undefined ) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, threshold, isInView]);

  return { ref, isInView };
};
