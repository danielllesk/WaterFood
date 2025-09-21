"use client";

import { LayoutNavbar } from "app/components/Navigation/LayoutNavbar";
import React, { Usable, use, useEffect, useState } from "react";
import { FilterResults } from "app/components/Filter/FilterResults";
import { Footer } from "app/components/Navigation/Footer";

export default function Page({ searchParams }: { searchParams: any }) {
  const query = use(searchParams);

  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState<any[] | null>();

  const fetchRestaurantsBySearchTerm = async () => {
    setIsLoading(true);

    try {
      // Use our Google Places API search endpoint
      const res = await fetch(`/api/search?query=${encodeURIComponent(searchTerm)}&location=Waterloo, Kitchener, ON, Canada&radius=75000`);

      if (!res.ok) {
        console.error("error fetching restaurants with your search term");
        setIsLoading(false);
        return;
      }

      const data = await res.json();

      // Filter restaurants that have photos
      const validRestaurantResults = (data.results || []).filter((restaurant) => restaurant.photos && restaurant.photos.length > 0);

      setRestaurants(validRestaurantResults);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setRestaurants([]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    //@ts-ignore
    if (query.searchTerm) {
      //@ts-ignore
      setSearchTerm(query.searchTerm);
    } else {
      console.error("query is invalid");
    }
  }, [query]);

  useEffect(() => {
    if (searchTerm) {
      fetchRestaurantsBySearchTerm();
    }
  }, [searchTerm]);

  return (
    <>
      <LayoutNavbar />
      <div className="site-body min-h-[80vh] py-5">
        <div className="px-4 font-['Graphik'] md:mx-auto md:my-0 md:flex md:w-[950px] md:flex-col">
          {isLoading && <p className="text-base text-sh-grey">Loading..</p>}

          {restaurants && <FilterResults restaurants={restaurants} />}
        </div>

        <Footer />
      </div>
    </>
  );
}
