'use client';
import { useEffect, useRef } from 'react';


const MethodDraw = () => {
  const editorRef = useRef(null);

  useEffect(() => {
    // Load Method Draw's script dynamically
    const script = document.createElement('script');
    script.src = '/method-draw/js/method-draw.js'; // Update path based on where the script is
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <iframe
        ref={editorRef}
        src="/method-draw/index.html"
        style={{ width: '100%', height: '700px', border: 'none' }}
      />
    </div>
  );
};

export default MethodDraw;
