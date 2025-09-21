"use client";

import RestaurantBackdrop from "../../components/Restaurant/RestaurantBackdrop";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RestaurantSynopsis from "../../components/Restaurant/RestaurantSynopsis";
import RestaurantPoster from "../../components/Restaurant/RestaurantPoster";
import { RestaurantReviews } from "../../components/Restaurant/RestaurantReviews";
import { LayoutNavbar } from "app/components/Navigation/LayoutNavbar";
import { Restaurant } from "app/types";
import { Footer } from "app/components/Navigation/Footer";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        // Use our Google Places API endpoint
        const res = await fetch(`/api/place/${id}`);

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Restaurant not found");
          }
          throw new Error("Failed to fetch restaurant");
        }

        const data: Restaurant = await res.json();
        setRestaurant(data);
      } catch (err) {
        console.error("Error fetching restaurant:", err);
        setError(true);
        router.replace("/404"); // Redirect to not found page
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurant();
  }, [id, router]);

  if (loading) return <p>Loading...</p>;
  if (error || !restaurant) return <p>Error loading restaurant.</p>;

  const backdrop = restaurant.photos?.[0] || "/placeholder-restaurant.jpg";
  const poster = restaurant.photos?.[0] || "/placeholder-restaurant.jpg";

  return (
    <>
      <LayoutNavbar />
      <div className="restaurant-body pb-5 md:mx-auto">
        <RestaurantBackdrop backdrop={backdrop} />
        <div className="flex flex-col px-4 md:mx-auto md:my-0 md:w-[950px]">
          <div className="mt-[-20%] flex flex-col gap-3 md:mt-[-10%] md:flex-row">
            <RestaurantPoster poster={poster} title={restaurant.name} id={restaurant.id} />
            <RestaurantSynopsis restaurant={restaurant} />
          </div>
          <div className="flex items-center justify-center">
            <RestaurantReviews restaurant={restaurant} />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
