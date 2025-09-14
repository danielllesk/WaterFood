import { LetsYou } from "../LetsYou/LetsYou";
import { RecentStories } from "../Stories/RecentStories";
import { GetStarted } from "./GetStarted";
import { LatestNews } from "./LatestNews";
import { PopularLists } from "./PopularLists";
import { PopularRestaurants } from "./PopularRestaurants";

export const HomeSignedOut = ({ restaurants }: { restaurants: any }) => {
  return (
    <div className="site-body py-5">
      <GetStarted />
      <div className="flex flex-col px-4 font-['Graphik'] md:mx-auto md:my-0 md:w-[950px]">
        <PopularRestaurants restaurants={restaurants} />
        <LetsYou />
      </div>

      <div className="site-content flex flex-col px-4 font-['Graphik'] md:mx-auto md:my-0 md:w-[950px] md:py-8">
        <PopularLists restaurants={restaurants} />
        <LatestNews />
        <RecentStories />
      </div>
    </div>
  );
};
