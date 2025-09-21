import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import React, { Suspense } from "react";
import "./globals.css";
import "./reset.css";

export const metadata: Metadata = {
  title: "FoodBoxd • Social restaurant discovery",
  description: "Social restaurant logging and discovery platform for Waterloo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <div id="root">
          <Suspense>{children}</Suspense>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
