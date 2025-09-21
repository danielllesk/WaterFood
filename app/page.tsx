"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";
import { Home } from "./components/Home/Home";
import { HomeSignedOut } from "./components/Home/HomeSignedOut";
import { LayoutNavbar } from "./components/Navigation/LayoutNavbar";
import { Footer } from "./components/Navigation/Footer";

export default function Page() {
  const [user, setUser] = useState<any>();
  const [restaurants, setRestaurants] = useState<any>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchPopularRestaurants = async () => {
    try {
      // Use our Google Places API search endpoint
      const res = await fetch('/api/search?query=restaurants&location=Waterloo, Kitchener, ON, Canada&radius=75000');
      
      if (!res.ok) {
        console.error("error fetching popular restaurants");
        return;
      }

      const data = await res.json();
      setRestaurants(data.results || []);
    } catch (error) {
      console.error("Error fetching popular restaurants:", error);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    fetchPopularRestaurants();
  }, []);
  return (
    <>
      <LayoutNavbar />
      {isLoggedIn && <Home restaurants={restaurants} user={user} />}

      {!isLoggedIn && <HomeSignedOut restaurants={restaurants} />}

      <Footer />
    </>
  );
}
