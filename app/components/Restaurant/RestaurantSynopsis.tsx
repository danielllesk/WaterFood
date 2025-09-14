import React, { useEffect, useState } from "react";
import RestaurantCast from "./RestaurantCast";

export const RestaurantSynopsis = ({ restaurant }: { restaurant: any }) => {
  const [year, setYear] = useState("");
  const [director, setDirector] = useState("");

  const setMovieData = () => {
    const directorName = restaurant?.credits?.crew?.find(
      ({ job }) => job === "Director"
    )?.name;

    const releaseYear = restaurant?.release_date?.substring(0, 4);

    setDirector(directorName);
    setYear(releaseYear);
  };

  useEffect(() => {
    setMovieData();
  }, []);

  return (
    <div className="flex flex-col md:w-1/2 md:pl-10">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-p-white font-['Tiempos-Regular'] text-4xl/[2.25rem] font-bold">
          {restaurant.title}
        </h1>
        <div className="flex gap-1 font-['Graphik']">
          {year && (
            <p className="text-p-white cursor-default underline">{year}</p>
          )}
          {director && (
            <>
              <p className="text-sh-grey">Directed by</p>
              <p className="text-p-white cursor-default underline">
                {director}
              </p>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <p className="text-sh-grey py-3 font-['Graphik'] text-sm uppercase">
          {restaurant.tagline}
        </p>
        <p className="text-sh-grey mb-3 max-w-sm font-['Tiempos-Light'] text-sm tracking-wide">
          {restaurant.overview}
        </p>
        <RestaurantCast actors={restaurant.credits.cast} />
      </div>
    </div>
  );
};

export default RestaurantSynopsis;
