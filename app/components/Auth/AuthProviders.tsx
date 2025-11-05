import React from "react";
import { SignInWithGoogle } from "./SignInWithGoogle";

export const AuthProviders = () => {
  return (
    <div className="ml-4 flex items-center self-center pt-2">
      <SignInWithGoogle />
    </div>
  );
};
