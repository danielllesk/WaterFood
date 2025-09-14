import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Restaurant, Review, UserReview } from "app/types";

export const RestaurantReviewExtended = ({
  review,
}: {
  review: UserReview | Review;
}) => {
  const [movie, setMovie] = useState<Restaurant>();

  const fetchRequestFromAPI = () => {
    // TODO: Replace with Google Places API call
    fetch(
      `https://api.themoviedb.org/3/movie/${review.restaurantID}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
    )
      .then((response) => response.json())
      .then((movie) => {
        setMovie(movie);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    fetchRequestFromAPI();
  }, [review]);

  return (
    <div className="border-b-grey flex border-b border-solid py-2">
      <div className=" hover:border-3 hover:border-h-hov-green border-pb-grey/25  relative  h-fit rounded  border  border-solid  shadow-[0_0_1px_1px_rgba(20,24,28,1)]  shadow-inner hover:cursor-pointer hover:rounded md:ml-1">
        <Link href={"/restaurant/" + movie?.id}>
          <Image
            className="block max-h-[120px] max-w-[80px] rounded border"
            src={movie?.photos?.[0] || "/placeholder-restaurant.jpg"}
            alt={"Restaurant title for" + movie?.name}
            height={300}
            width={300}
            loading="lazy"
          />
        </Link>
      </div>
      <div className="ml-3 w-full">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={"/restaurant/" + movie?.id}
            className="text-p-white hover:text-hov-blue flex items-start justify-between gap-1 text-base font-bold"
          >
            {movie?.name}
          </Link>
        </div>
        {review?.timestamp && (
          <p className="text-sh-grey text-xs">{review.timestamp}</p>
        )}
        <p className="text-sh-grey pt-2 text-sm">{review.review}</p>
      </div>
    </div>
  );
};
