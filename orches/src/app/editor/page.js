'use client';
import { useRouter } from 'next/navigation';

export default function Editor() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-yellow-200 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl mb-4">Welcome to the Editor Page</h1>
      <p className="text-lg mb-8">
        This is the description for the editor page. Add more content here to make the page longer and test scrolling.
      </p>
      <div className="h-96 w-full bg-gray-300 mb-8 flex items-center justify-center">
        <p>Additional Content Block</p>
      </div>
      <div className="flex gap-4 mt-auto">
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
