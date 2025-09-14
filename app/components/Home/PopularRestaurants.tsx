import React from "react";
import { PopularRestaurantPoster } from "./PopularRestaurantPoster";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const PopularRestaurants = ({ restaurants }: { restaurants: any }) => {
  const path = usePathname();

  return (
    <>
      <div className="section-heading border-b-grey text-sh-grey mb-3 flex justify-between border-b border-solid text-xs">
        <p className="hover:text-hov-blue text-sm hover:cursor-pointer">
          POPULAR ON FOODBOXD
        </p>{" "}
        {!path.includes("restaurants") && (
          <Link
            href={"/restaurants"}
            className="hover:text-hov-blue text-[11px] hover:cursor-pointer"
          >
            MORE
          </Link>
        )}
      </div>

      <div className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {!restaurants &&
          "No popular restaurants available at the moment. Please try again later."}

        {restaurants &&
          restaurants
            .filter((restaurant) => !!restaurant.poster_path)
            .slice(0, 6)
            .map((restaurant) => (
              <PopularRestaurantPoster key={restaurant.id} restaurant={restaurant} />
            ))}
      </div>
    </>
  );
};
