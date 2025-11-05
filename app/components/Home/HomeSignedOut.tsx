import { LetsYou } from "../LetsYou/LetsYou";
import { GetStarted } from "./GetStarted";
import { PopularRestaurants } from "./PopularRestaurants";

export const HomeSignedOut = ({ restaurants }: { restaurants: any }) => {
  return (
    <div className="site-body py-5">
      <GetStarted />
      <div className="flex flex-col px-4 font-['Graphik'] md:mx-auto md:my-0 md:w-[950px]">
        <PopularRestaurants restaurants={restaurants} />
        <LetsYou />
      </div>
    </div>
  );
};
