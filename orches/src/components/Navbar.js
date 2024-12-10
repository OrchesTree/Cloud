'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, signInWithPopup } from '@/lib/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully signed in!');
    } catch (error) {
      // Handle specific error codes
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          console.warn('Popup closed by user before completing sign-in.');
          toast.info('Sign-in popup closed. Please try again.');
          break;
        case 'auth/network-request-failed':
          console.error('Network error during sign-in:', error);
          toast.error('Network error. Please check your connection and try again.');
          break;
        case 'auth/cancelled-popup-request':
          console.warn('Popup request was cancelled.');
          toast.info('Sign-in popup request was cancelled. Please try again.');
          break;
        default:
          console.error('Google Login Error:', error);
          toast.error(`Login failed: ${error.message}`);
      }
    }
  };
  
  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.info('Logged out successfully!');
    } catch (error) {
      console.error('Logout Error:', error);
      toast.error('Logout failed!');
    }
  };

  return (
    <nav className="w-full bg-blue-500 p-4 text-white flex justify-between items-center">
      <div className="text-2xl font-bold cursor-pointer hover:italic" onClick={() => router.push('/')}>
        OrchesTree
      </div>
      <div className="flex gap-4 items-center">
        <button onClick={() => router.push('/')} className="hover:font-bold hover:italic">
          Home
        </button>
        <button onClick={() => router.push('/generate')} className="hover:font-bold hover:italic">
          Generate
        </button>
        <button onClick={() => router.push('/editor')} className="hover:font-bold hover:italic">
          Editor
        </button>

        {loading ? (
          <span>Loading...</span>
        ) : user ? (
          <>
            {user.photoURL && (
              <img src={user.photoURL} alt="User Avatar" className="w-8 h-8 rounded-full mr-4" />
            )}
            <span className="mr-4">Hi, {user.displayName}!</span>
            <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
              Logout
            </button>
          </>
        ) : (
          <button onClick={handleGoogleLogin} className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">
            Sign in with Google
          </button>
        )}
      </div>
      <ToastContainer />
    </nav>
  );
}
