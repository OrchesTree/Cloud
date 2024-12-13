'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

interface Dot {
  id: number;
  top: string;
  left: string;
  color: string;
  animationDelay: string;
}

export default function Home() {
  const [dots, setDots] = useState<Dot[]>([]);
  const [showParagraphs, setShowParagraphs] = useState([false, false, false]);

  useEffect(() => {
    const colors = [
      '#ff0000', '#30ff00', '#ffffff', '#c301ff',
      '#00ddff', '#fe01ad', '#59a700', '#ffee00',
      '#ffffff', '#ffffff', '#ffffff', '#ffffff',
    ];

    const generateDots = () => {
      const newDots = Array.from({ length: 200 }, (_, index) => ({
        id: index,
        top: `${Math.random() * 100}vh`,
        left: `${Math.random() * 100}vw`,
        color: colors[Math.floor(Math.random() * colors.length)],
        animationDelay: `${Math.random() * 3}s`,
      }));
      setDots(newDots);
    };

    generateDots();

    const interval = setInterval(generateDots, 10000);
    return () => clearInterval(interval);
  }, []);

  // Reveal paragraphs sequentially with delays
  useEffect(() => {
    showParagraphs.forEach((_, index) => {
      setTimeout(() => {
        setShowParagraphs((prev) => {
          const updated = [...prev];
          updated[index] = true;
          return updated;
        });
      }, index * 2000); // Delay each paragraph by 2 seconds
    });
  }, []);

  // Function to split a paragraph into lines
  const animateLines = (text: string) =>
    text.split('. ').map((line, index) => (
      <div
        key={index}
        className="opacity-0 animate-line-fade-in"
        style={{ animationDelay: `${index * 500}ms` }} // Stagger each line by 500ms
      >
        {line}.
      </div>
    ));

  return (
<div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-900 via-gray-1000 to-black text-white relative overflow-hidden">

      {/* Navbar */}
      {/* <Navbar variant="home" /> */}
      <Navbar />

      {/* Blinking Dots */}
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute w-1 h-1 rounded-full animate-blink"
          style={{
            top: dot.top,
            left: dot.left,
            backgroundColor: dot.color,
            animationDelay: dot.animationDelay,
          }}
        />
      ))}

      <div className="max-w-2xl px-1 pt-16 z-10 text-2xl leading-relaxed text-center text-alignment">
        {showParagraphs[0] && (
          <div className="mb-3">
            {animateLines(
              'At its heart, OrchesTree embodies the belief that complexity can be made harmonious through structure and insight'
            )}
          </div>
        )}

        {showParagraphs[1] && (
          <div className="mb-8">
            {animateLines(
              'OrchesTree reveals a deeper order, a hidden architecture that transforms chaos into coherence. Every resource, every cluster, and every relationship is part of a living system — one that must be visualized, understood, and nurtured'
            )}
          </div>
        )}

        {showParagraphs[2] && (
          <div className="mb-8">
            {animateLines(
              'OrchesTree champions the idea that understanding precedes mastery. To manage complexity, we must first see it clearly. To grow technology, we must root it in comprehension. This tool is a reminder that, like nature, technology flourishes best when we respect the delicate interplay of its parts, growing with purpose and vision'
            )}
          </div>
        )}
      </div>
    </div>
  );
}
