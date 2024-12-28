'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for `app` directory
import Navbar from '@/components/Navbar';

const EditorPage = () => {
  const router = useRouter();
  const iframeRef = useRef(null);

  useEffect(() => {
    // Scroll to the top immediately after navigation
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    // Ensure the page scrolls to the top
    handleRouteChange();

    // Retrieve the SVG data from sessionStorage
    const svgData = sessionStorage.getItem('svgData');
    if (!svgData) {
      console.error('No SVG data found, redirecting to generate page.');
      router.push('/generate');
      return;
    }

    // Log the SVG data for debugging
    console.log('SVG Data:', svgData);

    // Define the handler to send the SVG data to the iframe
    const handleIframeLoad = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        console.log('Posting message to iframe...');
        iframeRef.current.contentWindow.postMessage(
          { type: 'LOAD_SVG', payload: svgData },
          'http://localhost:9000' // Update this if Method Draw is hosted on another origin
        );
      } else {
        console.error('iframeRef or contentWindow is not available.');
      }
    };

    // Attach the load event listener to the iframe
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }

    // Cleanup event listener on component unmount
    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, [router]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Navbar />
      <iframe
        ref={iframeRef}
        src="http://localhost:9000" // Ensure this matches where Method Draw is hosted
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Method Draw Editor"
      ></iframe>
    </div>
  );
};

export default EditorPage;
