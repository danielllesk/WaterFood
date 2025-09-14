import React from "react";

export const GetStarted = () => {
  return (
    <>
      <div
        className="started-backdrop block h-[250px] max-h-[250px] md:m-auto md:mt-[-5%] md:h-[650px] md:max-h-[650px] md:w-[950px]"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)`,
        }}
      ></div>

      <div className="relative z-40 mt-[5%] flex flex-col items-center gap-2 md:mt-[-15%]">
        <div className="gradient-helper-mobile text-center text-2xl font-bold text-[#fff] md:text-5xl">
          <p>Track restaurants you've visited.</p>
          <p>Save those you want to try.</p>
          <p>Tell your friends what's good.</p>
        </div>
        <button className="md:text-l hover:bg-b-h-green sans-serif  bg-b-green mt-1 h-10 rounded px-5 text-sm text-[#fff] md:px-8 ">
          GET STARTED - IT'S FREE!
        </button>

        <div className="sans-serif  text-sh-grey my-2 flex flex-col  items-center gap-2 text-xs md:flex-row  md:text-base   md:text-xl">
          <p>The social network for food lovers.</p>
          <p>Also available on iOS, Apple TV and Android</p>
        </div>
      </div>
    </>
  );
};
