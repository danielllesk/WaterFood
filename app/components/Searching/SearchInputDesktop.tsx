import React from "react";
import { RestaurantSearchInput } from "./RestaurantSearchInput";

export const SearchInputDesktop = () => {
  const hideExtendedSearch = () => {
    closeSearchBar();
    displaySearchIcon();
  };

  const closeSearchBar = () => {
    const SBD = document.querySelector(".search-bar-desktop");
    SBD?.classList.add("md:hidden");
  };

  const displaySearchIcon = () => {
    const SID = document.querySelector(".search-icon-desktop");
    SID?.classList.remove("md:hidden");
    SID?.classList.add("md:block");
  };

  return (
    <RestaurantSearchInput 
      isMobile={false} 
      onClose={hideExtendedSearch}
    />
  );
};
