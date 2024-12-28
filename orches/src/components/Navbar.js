'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, signInWithPopup } from '@/lib/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

export default function Navbar({ variant = 'default' }) {
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
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          toast.info('Sign-in popup closed. Please try again.');
          break;
        case 'auth/network-request-failed':
          toast.error('Network error. Please check your connection and try again.');
          break;
        case 'auth/cancelled-popup-request':
          toast.info('Sign-in popup request was cancelled. Please try again.');
          break;
        default:
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
      toast.error('Logout failed!');
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full p-4 flex justify-between items-center shadow-md z-50 transition-all duration-100 bg-black bg-opacity-55 backdrop-blur text-white"
    >
      <div
        className="flex items-center space-x-2 text-2xl font-bold cursor-pointer hover:italic"
        onClick={() => router.push('/')}
      >
        <Image
          src={variant === 'home' ? '/otlogowhite.png' : '/otlogo.png'}
          alt="OrchesTree Logo"
          width={50}
          height={50}
          priority
        />
        <span>OrchesTree</span>
      </div>

      <div className="flex gap-4 items-center">
        <button onClick={() => router.push('/')} className="hover:font-bold">
          Home
        </button>
        <button onClick={() => router.push('/generate')} className="hover:font-bold">
          Generate
        </button>
        {/* <button onClick={() => router.push('/editor')} className="hover:font-bold">
          Editor
        </button> */}

        {loading ? (
          <span>Loading</span>
        ) : user ? (
          <>
            <div className="w-8 h-8">
              <Image
                src={user.photoURL || '/default-avatar.png'}
                alt="User Avatar"
                width={32}
                height={32}
                className="rounded-full"
                priority
              />
            </div>
            {user.displayName && <span>Hi, {user.displayName.split(' ')[0]}!</span>}
            <button
              onClick={handleLogout}
              className={`px-4 py-1 rounded-full mr-8 ${
                variant === 'home' ? 'bg-black text-white hover:bg-red-600' : 'bg-white text-black hover:bg-red-600'
              }`}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <div className="w-8 h-8 invisible" />
            <button
              onClick={handleGoogleLogin}
              className={`px-4 py-1 rounded-full ml-1 mr-8 bg-white text-black hover:bg-gray-800 hover:text-white`}
            >
              Sign in with Google
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
