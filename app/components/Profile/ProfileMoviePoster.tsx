import { useEffect, useState } from "react";
import { Loader } from "../Loader/Loader";
import Link from "next/link";
import Image from "next/image";
import FavouriteButton from "../Buttons/FavoriteButton";
import { WatchButton } from "../Buttons/WatchButton";
import { Restaurant, UserFavourite, UserAteAt } from "app/types";

export const ProfileMoviePoster = ({
  watched,
  favourites,
  movieId,
  onEvent,
}: {
  watched: UserAteAt[];
  favourites: UserFavourite[];
  movieId: string;
  onEvent: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [movie, setMovie] = useState<Restaurant>({} as Restaurant);

  const [isFavourite, setIsFavourite] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  const setInitialMovieStatuses = () => {
    const isFavorite = favourites.some((restaurants) => restaurants?.restaurantID === movieId);
    setIsFavourite(isFavorite);

    const isWatched = watched.some((restaurants) => restaurants?.restaurantID === movieId);
    setIsWatched(isWatched);
  };

  useEffect(() => {
    setIsLoading(true);

    const movieURL = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;

    fetch(movieURL)
      .then((res) => res.json())
      .then((movie) => {
        setMovie(movie);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err.message);
        setIsLoading(false);
      });

    setInitialMovieStatuses();
  }, [movieId]);

  if (isLoading) return <Loader />;

  return (
    <div
      className="hover:border-3 hover:border-h-hov-green border-pb-grey/25 relative mb-[2%] rounded border border-solid shadow-[0_0_1px_1px_rgba(20,24,28,1)] shadow-inner hover:cursor-pointer hover:rounded md:ml-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={"/movie/" + movie.id}>
        <Image
          className="block max-h-[120px] max-w-[80px]  rounded border md:max-h-[220px] md:max-w-[140px] "
          src={movie.photos?.[0] || "/placeholder-restaurant.jpg"}
          alt={"Title for" + movie.name}
          loading="lazy"
          width={300}
          height={300}
        />
      </Link>
      {isHovered && (
        <div
          className="absolute left-[20%] top-[75%] z-10 flex items-center rounded p-0.5"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
        >
          <FavouriteButton
            id={movie.id}
            title={movie.name}
            isFavourite={isFavourite}
            setIsFavourite={setIsFavourite}
            onEvent={onEvent}
          />

          <WatchButton
            id={movie.id}
            title={movie.name}
            isWatched={isWatched}
            setIsWatched={setIsWatched}
            onEvent={onEvent}
          />
        </div>
      )}
    </div>
  );
};
