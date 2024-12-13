'use client';
import Navbar from '@/components/Navbar';
import SVGEditor from '@/components/SVGCanvas';

const EditorPage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-1000 to-black flex flex-col items-center overflow-y-auto text-white relative">
      {/* Navbar */}
      <Navbar />

      {/* SVG Editor Canvas */}
      <div className="w-full max-w-4xl my-4">
        <SVGEditor />
      </div>
    </div>
  );
};

export default EditorPage;
