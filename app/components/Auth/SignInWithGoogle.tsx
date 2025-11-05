import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import React from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

// When i sign in, check if user exists
// If not, create db references and docs and collection for it like this:
// users / displayName (name, bio, reviews, watched) /favourites (movieid, isfav) / reviews (movieid, review) /watched(movieid, iswatched)/watchlist

export const SignInWithGoogle = () => {
  const signInWithGoogle = async () => {
    try {
      // Check if auth is properly initialized
      if (!auth) {
        console.error('Firebase Auth is null. Debug info:', {
          auth,
          hasEnvVars: {
            apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          }
        });
        alert('Firebase Auth is not initialized.\n\nPlease:\n1. Stop your dev server (Ctrl+C)\n2. Delete the .next folder: rm -rf .next\n3. Restart: npm run dev\n\nThis will reload environment variables from .env');
        return;
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (!result.user) {
        throw new Error('Sign in failed: No user returned from authentication');
      }
      
      console.log('✅ Google sign-in successful:', result.user.email);
      
      // Check if Firestore is available
      if (!db) {
        console.warn('Firestore db is not initialized. User signed in but database operations will fail.');
        alert('Sign in successful! However, Firestore database is not available.\n\nPlease:\n1. Go to Firebase Console\n2. Enable Firestore Database\n3. Create database in production mode\n4. Refresh this page');
        return;
      }
      
      // Verify if user exists in firestore db
      try {
        const userDoc = await getDoc(
          doc(db, "users/" + result.user.uid)
        );

        // Create a new doc reference for the new user
        if (!userDoc.exists()) {
          await addNewUserToDB();
          console.log('✅ New user created in Firestore');
        } else {
          console.log('✅ Existing user found in Firestore');
        }
      } catch (dbError: any) {
        console.error('Firestore error:', dbError);
        if (dbError.message?.includes('offline') || dbError.code === 'unavailable') {
          alert('Sign in successful! However, Firestore database is offline.\n\nPlease:\n1. Go to Firebase Console (https://console.firebase.google.com/)\n2. Select project: waterfood-bf308\n3. Go to Firestore Database\n4. Click "Create database" if not created\n5. Choose "Start in production mode"\n6. Refresh this page');
        } else {
          throw dbError;
        }
      }
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(
        "Error while signing in with Google account: ",
        errorCode,
        errorMessage
      );
      
      // Provide more helpful error messages
      let userMessage = errorMessage;
      if (errorCode === 'auth/configuration-not-found') {
        userMessage = `Firebase Authentication is not configured for this project.\n\nThis usually means:\n1. Firebase Authentication is not enabled in your Firebase Console\n2. The API key or project ID doesn't match your Firebase project\n\nPlease:\n1. Go to Firebase Console (https://console.firebase.google.com/)\n2. Select your project: waterfood-bf308\n3. Enable Authentication (Authentication > Get Started)\n4. Enable "Google" sign-in method\n5. Verify your API key and project ID match`;
      } else if (errorCode === 'auth/popup-closed-by-user') {
        userMessage = 'Sign in was cancelled.';
        return; // Don't show alert for user cancellation
      }
      
      // Show user-friendly error message
      alert(`Failed to sign in: ${userMessage}`);
    }
  };

  const addNewUserToDB = async () => {
    if (!auth.currentUser) {
      console.error('No current user to add to database');
      return;
    }

    if (!db) {
      console.error('Firestore db is not initialized');
      return;
    }

    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        name: auth.currentUser.displayName || "User",
        uid: auth.currentUser.uid,
        bio: "My restaurant discovery journey, on FoodBoxd :)",
        photoUrl: auth.currentUser.photoURL || "",
        reviews: [],
        ateAt: [],
        favourites: [],
        following: [],
      });
      console.log('✅ User document created successfully');
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(
        "Could not create a new Firestore doc: ",
        errorCode,
        errorMessage
      );
      
      if (errorMessage?.includes('offline') || errorCode === 'unavailable') {
        throw new Error('Firestore database is offline. Please enable Firestore Database in Firebase Console.');
      }
      throw error;
    }
  };

  return (
    <p
      className="sans-serif text-sh-grey md:hover:text-p-white z-50 mx-3 font-bold uppercase tracking-widest md:mx-0 md:ml-4 md:text-xs md:hover:cursor-pointer"
      onClick={signInWithGoogle}
    >
      Google
    </p>
  );
};
