import Image from "next/image";
import Link from "next/link";
import React from "react";

export const LatestNews = () => {
  return (
    <>
      <div className="section-heading border-b-grey text-sh-grey mb-3 flex justify-between border-b border-solid text-sm">
        <p className="hover:text-hov-blue   text-sm hover:cursor-pointer">
          LATEST NEWS
        </p>
        <p className="hover:text-hov-blue text-[11px] hover:cursor-pointer">
          MORE
        </p>
      </div>
      <div className="mb-9 flex flex-col pb-9 md:flex-row">
        <Image
          src={
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
          }
          width={310}
          height={174}
          alt="Waterloo restaurant scene"
          loading="lazy"
          className="w-full rounded
        md:w-[32%]"
        />
        <div className="bg-c-blue md:p-4">
          <h1 className="text-p-white hover:text-hov-blue mt-2  pl-3  text-xl  font-bold tracking-wider  hover:cursor-pointer md:mt-0">
            Waterloo Eats!
          </h1>
          <p className="text-sh-grey my-1.5 pl-3">
            The FoodBoxd team explores the vibrant restaurant scene in Waterloo,
            discovering hidden gems and culinary delights.
            <Link
              href="/journal"
              className="text-p-white hover:text-hov-blue text-[11px] font-bold"
            >
              {" "}
              READ MORE
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};
