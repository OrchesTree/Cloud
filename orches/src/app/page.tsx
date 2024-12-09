'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-8">OrchesTree</h1>
      <button
        onClick={() => router.push('/generate')}
        className="px-6 py-3 bg-blue-500 text-white text-lg rounded hover:bg-blue-600 transition"
      >
        Go to Generate Page
      </button>
    </div>
  );
}
