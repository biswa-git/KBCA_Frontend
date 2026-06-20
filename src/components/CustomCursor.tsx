import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ringPosition, setRingPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      setPosition({ x: mx, y: my });
    };

    const animateCursor = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      setRingPosition({ x: rx, y: ry });
      requestAnimationFrame(animateCursor);
    };

    document.addEventListener('mousemove', handleMouseMove);
    const animationId = requestAnimationFrame(animateCursor);

    // Hover effect on interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, .luminary-card, .event-card, .program-item'
    );

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        className="cursor"
        id="cursor"
        style={{
          left: position.x + 'px',
          top: position.y + 'px',
          width: isHovering ? '20px' : '10px',
          height: isHovering ? '20px' : '10px',
        }}
      />
      <div
        className="cursor-ring"
        id="cursorRing"
        style={{
          left: ringPosition.x + 'px',
          top: ringPosition.y + 'px',
          width: isHovering ? '52px' : '36px',
          height: isHovering ? '52px' : '36px',
        }}
      />
    </>
  );
}
