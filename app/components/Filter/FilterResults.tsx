import Link from "next/link";
import { PopularRestaurantPoster } from "../Home/PopularRestaurantPoster";

export const FilterResults = ({ restaurants }: { restaurants: any[] }) => {
  return (
    <div className="w-full font-['Graphik'] md:mx-auto md:my-0 md:flex md:flex-row">
      <div className="flex w-full flex-col">
        <div className="section-heading mb-3 flex justify-between border-b border-solid border-b-grey text-xs text-sh-grey">
          <div className="text-base">Restaurant results</div>
        </div>

        <div>
          {restaurants.length === 0 && <p className="text-base text-sh-grey">No results found, please try again.</p>}
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="my-2 flex flex-col gap-4 border-b border-solid border-b-grey pb-2 md:flex-row"
            >
              <div className="min-w-[150px] max-w-[150px]">
                <PopularRestaurantPoster restaurant={restaurant} compact={false} />
              </div>
              <div className="flex flex-col">
                <Link href={"/restaurant/" + restaurant.id} className="text-xl font-bold text-p-white">
                  {restaurant.title}
                </Link>
                <div className="flex flex-col gap-2 text-sh-grey">
                  <p className="text-sm">Rating: {restaurant.vote_average.toFixed(2)}</p>
                  <p className="text-normal">{restaurant.overview}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
