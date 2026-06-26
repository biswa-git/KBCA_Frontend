import { useEffect, useMemo, useRef, useState, type RefCallback } from 'react';

export default function useScrollReveal(count: number) {
  const elements = useRef<(HTMLElement | null)[]>([]);
  const [isVisible, setIsVisible] = useState(Array(count).fill(false));
  const refs = useMemo(
    () =>
      Array.from(
        { length: count },
        (_, index): RefCallback<HTMLElement> =>
          (node) => {
            elements.current[index] = node;
          }
      ),
    [count]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = elements.current.findIndex((element) => element === entry.target);
            if (index !== -1) {
              setIsVisible((prev) => {
                const newVisible = [...prev];
                newVisible[index] = true;
                return newVisible;
              });
            }
          }
        });
      },
      { threshold: 0.12 }
    );

    const observedElements = elements.current.filter((element): element is HTMLElement => Boolean(element));
    observedElements.forEach((element) => observer.observe(element));

    return () => {
      observedElements.forEach((element) => observer.unobserve(element));
    };
  }, [refs]);

  return { refs, isVisible };
}
