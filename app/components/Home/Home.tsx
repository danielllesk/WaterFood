import React from "react";
import { IntroMessage } from "./IntroMessage";
import { PopularRestaurants } from "./PopularRestaurants";
import { UpgradeToPro } from "./UpgradeToPro";
import { PopularLists } from "./PopularLists";
import { LatestNews } from "./LatestNews";
import { RecentStories } from "../Stories/RecentStories";

export const Home = ({ restaurants, user }: { restaurants: any; user: any }) => {
  return (
    <div className="site-body py-5">
      <div className="flex flex-col px-4 font-['Graphik'] md:mx-auto md:my-0 md:w-[950px]">
        <IntroMessage user={user} />
        <PopularRestaurants restaurants={restaurants} />
        <UpgradeToPro />
      </div>
      <div className="site-content flex flex-col px-4 font-['Graphik'] md:mx-auto md:my-0 md:w-[950px] md:py-8">
        <PopularLists restaurants={restaurants} />
      </div>
    </div>
  );
};
