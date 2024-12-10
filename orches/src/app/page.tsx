'use client';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-top p-8">

      {/* Navbar */}
      <Navbar />

      <h1 className="text-5xl font-bold m-8">OrchesTree</h1>
  
    </div>
  );
}
