'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, signInWithPopup } from '@/lib/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Firestore functions
import { db } from '@/lib/firebaseConfig'; // Firestore instance
import Image from 'next/image';

export default function Navbar({ variant = 'default' }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remainingGenerations, setRemainingGenerations] = useState(null); // State for remaining generations
  const router = useRouter();

  // Monitor authentication state and fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        await initializeUser(currentUser.uid);
        await resetAndFetchGenerations(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize the user document in Firestore if it doesn't exist
  const initializeUser = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        // Create a new document with default values
        await setDoc(userDocRef, {
          generationCount: 0,
          lastGenerationDate: null,
        });
        console.log('New user document created in Firestore.');
      } else {
        console.log('User document already exists.');
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  };

  // Reset the generation count if it's a new day and fetch the remaining generations
  const resetAndFetchGenerations = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const now = new Date();
        const gmtNow = new Date(now.toISOString().split('T')[0] + 'T00:00:00.000Z');
        const lastGenerationDate = userData.lastGenerationDate
          ? new Date(userData.lastGenerationDate)
          : null;

        let generationCount = userData.generationCount || 0;

        // Reset count if it's a new day
        if (!lastGenerationDate || lastGenerationDate < gmtNow) {
          generationCount = 0;
          await updateDoc(userDocRef, {
            generationCount: 0,
            lastGenerationDate: gmtNow.toISOString(),
          });
          console.log('Generation count reset for the new day.');
        }

        const remaining = 3 - generationCount;
        setRemainingGenerations(remaining);
      } else {
        console.warn('User document not found.');
        setRemainingGenerations(null);
      }
    } catch (error) {
      console.error('Error resetting or fetching user data:', error);
      setRemainingGenerations(null);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;

      if (currentUser) {
        await initializeUser(currentUser.uid);
        await resetAndFetchGenerations(currentUser.uid);
      }
      console.log('Successfully signed in!');
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Logged out successfully!');
      setRemainingGenerations(null); // Clear remaining generations on logout
    } catch (error) {
      console.error('Logout failed!');
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

        {loading ? (
          <span>Loading...</span>
        ) : user ? (
          <>
            {remainingGenerations !== null && (
              <span className="text-md text-gray-500">
                Credits {remainingGenerations}
              </span>
            )}
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
