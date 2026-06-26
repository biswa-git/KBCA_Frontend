import { useEffect, useMemo, useRef, useState, type RefCallback } from 'react';

export default function useScrollReveal(count: number) {
  const elements = useRef<(HTMLElement | null)[]>([]);
  // Keep the observer in a ref so ref callbacks can access it at any time
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isVisible, setIsVisible] = useState(Array(count).fill(false));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = elements.current.findIndex((el) => el === entry.target);
            if (index !== -1) {
              setIsVisible((prev) => {
                const next = [...prev];
                next[index] = true;
                return next;
              });
            }
          }
        });
      },
      { threshold: 0.12 }
    );

    observerRef.current = observer;

    // Observe any elements that were already attached before this effect ran
    elements.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, []); // intentionally empty — observer is created once and lives for the component lifetime

  const refs = useMemo(
    () =>
      Array.from(
        { length: count },
        (_, index): RefCallback<HTMLElement> =>
          (node) => {
            const prev = elements.current[index];

            // Unobserve the old node when element unmounts or swaps
            if (prev && observerRef.current) {
              observerRef.current.unobserve(prev);
            }

            elements.current[index] = node;

            // Observe the new node as soon as it mounts — this handles conditionally
            // rendered elements that weren't in the DOM when the observer was created
            if (node && observerRef.current) {
              observerRef.current.observe(node);
            }
          }
      ),
    [count]
  );

  return { refs, isVisible };
}
