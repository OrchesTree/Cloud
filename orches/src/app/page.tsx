'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import DotBackground from '@/components/DotBackground';

export default function Home() {
  const [showParagraphs, setShowParagraphs] = useState([false, false, false]);

  useEffect(() => {
    showParagraphs.forEach((_, index) => {
      setTimeout(() => {
        setShowParagraphs((prev) => {
          const updated = [...prev];
          updated[index] = true;
          return updated;
        });
      }, index * 2000);
    });
  }, [showParagraphs]);

  const animateLines = (text: string) =>
    text.split('. ').map((line, index) => (
      <div
        key={index}
        className="opacity-0 animate-line-fade-in"
        style={{ animationDelay: `${index * 500}ms` }}
      >
        {line}.
      </div>
    ));

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-900 via-gray-1000 to-black text-white relative overflow-hidden">
      {/* Navbar */}
        <Navbar />
        
      {/* Background Dots */}
      <DotBackground />

      {/* Content */}
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
              'Every resource, every cluster, and every relationship is part of a living system — one that must be visualized, understood, and nurtured'
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
