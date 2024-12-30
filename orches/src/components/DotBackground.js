'use client';
import { useEffect, useState } from 'react';

export default function DotBackground() {
  const [dots, setDots] = useState([]);
  const [,setPageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const colors = [
      '#ff0000', '#30ff00', '#ffffff', '#c301ff',
      '#00ddff', '#fe01ad', '#59a700', '#ffee00',
      '#ffffff', '#ffffff',
    ];

    const generateDots = (dimensions) => {
      const newDots = Array.from({ length: 100 }, (_, index) => ({
        id: index,
        top: `${Math.random() * dimensions.height}px`, // Full page height in pixels
        left: `${Math.random() * dimensions.width}px`, // Full page width in pixels
        color: colors[Math.floor(Math.random() * colors.length)],
        // Random delay between 1 and 3 seconds`,
        animationDelay: `${Math.random() * 2 + 1}s`,
        isBlurry: Math.random() > 0.4, // 30% chance to be blurry
      }));
      setDots(newDots);
    };

    const updatePageDimensions = () => {
      const height = document.body.scrollHeight; // Full height of the document
      const width = document.body.scrollWidth; // Full width of the document
      const newDimensions = { width, height };
      setPageDimensions(newDimensions); // Update dimensions
      generateDots(newDimensions); // Regenerate dots with new dimensions
    };

    // Initial setup
    updatePageDimensions();

    // Recalculate dimensions on window resize
    window.addEventListener('resize', updatePageDimensions);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', updatePageDimensions);
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="absolute inset-0 z-0">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute w-1 h-1 rounded-full animate-blink"
          style={{
            top: dot.top,
            left: dot.left,
            backgroundColor: dot.color,
            animationDelay: dot.animationDelay,
            filter: dot.isBlurry ? 'blur(2px)' : 'none',
          }}
        />
      ))}
    </div>
  );
}
