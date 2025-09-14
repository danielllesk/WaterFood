import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-navigation-bg relative">
      <div className="flex flex-col px-4 py-6 font-['Graphik'] md:mx-auto md:my-0 md:w-[950px]">
        <p className="text-sh-grey text-center text-xs">
          © FoodBoxd Limited. Restaurant data from Google Places API.
        </p>
      </div>
    </footer>
  );
};
