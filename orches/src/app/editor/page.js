'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function Editor() {
  const router = useRouter();
  const [iframeError, setIframeError] = useState(false);

  return (
    <div className="min-h-screen bg-yellow-200 flex flex-col items-center justify-center p-8">

      {/* Navbar */}
      <Navbar />

      <h1 className="text-4xl mb-4">Welcome to the Editor Page</h1>

      {/* Conditional Rendering Based on iframeError */}
      <div className="w-full h-[600px] border border-gray-300 rounded mb-4">
        {!iframeError ? (
          <iframe
            src="https://editor.method.ac/"
            title="Method Draw SVG Editor"
            className="w-full h-full"
            allow="fullscreen"
            onError={() => setIframeError(true)}  // Handle iframe load errors
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-red-500 mb-4">Failed to load the editor. Please try opening it in a new tab.</p>
            <button
              onClick={() => window.open('https://editor.method.ac/', '_blank')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Open Editor in New Tab
            </button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => router.push('/generate')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Go to Generate
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
