import Image from "next/image";
import Link from "next/link";
import React from "react";

export const UpgradeToPro = () => {
  // Placeholder URLs - replace with FoodBoxd Pro banners when ready
  let url = "/assets/pro-banner-desktop.png";
  let mobileUrl = "/assets/pro-banner-mobile.png";
  return (
    <>
      <Link href="https://waterloo.foodboxd.com/pro">
        <Image
          className="mb-8 block self-center md:hidden"
          src={mobileUrl}
          width={100}
          height={100}
          alt="upgrade to FoodBoxd pro banner"
          loading="lazy"
        />
      </Link>
      <Link href="https://waterloo.foodboxd.com/pro">
        <Image
          className="mb-8 hidden self-center md:block"
          src={url}
          alt="upgrade to FoodBoxd pro banner"
          height={100}
          width={950}
          loading="lazy"
        />
      </Link>
    </>
  );
};
