import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import placeholder from "@/assets/sappling.jpg";
import { User } from "app/types";
import { auth } from "../../firebase/firebase";

export const ProfileBio = ({
  user,
  isAuthor,
}: {
  user: User;
  isAuthor: boolean;
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((userAuth) => {
      if (userAuth) {
        setCurrentUserId(userAuth.uid);
        // fetch if following
        fetch(`/api/follow?userId=${userAuth.uid}&targetUserId=${user.uid}`)
          .then(res => res.json())
          .then(data => setIsFollowing(data.isFollowing || false))
          .catch(err => {
            console.error('Error fetching follow status:', err);
            setIsFollowing(false);
          });
      } else {
        setCurrentUserId(null);
        setIsFollowing(false);
      }
    });
    return unsubscribe;
  }, [user.uid]);

  const handleFollow = async () => {
    if (!currentUserId) return;
    const action = isFollowing ? 'unfollow' : 'follow';
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, targetUserId: user.uid, action })
      });
      if (res.ok) {
        setIsFollowing(!isFollowing);
      } else {
        console.error('Failed to update follow status');
      }
    } catch (error) {
      console.error('Error updating follow:', error);
    }
  };

  return (
    <div className="mb-10 flex flex-col items-center md:flex-row md:justify-between">
      <div className="flex flex-col items-center">
        <div className="flex">
          <Image
            src={user.photoUrl || placeholder}
            alt="your user profile avatar"
            width={85}
            height={85}
            loading="lazy"
            className="hover:border-sh-grey h-[5rem] w-[5rem] rounded-[50px] border border-solid border-[#678] hover:cursor-pointer md:h-[100px] md:w-[100px] "
          />

          <div className=" ml-4 mt-3 md:flex md:flex-col md:items-start md:gap-1 ">
            <div className="flex w-full flex-col items-start gap-4 md:flex-row">
              <h1 className="sans-serif text-p-white text-2xl font-bold">
                {user.name}
              </h1>
              {isAuthor && (
                <Link
                  href="/settings"
                  className="sans-serif text-p-white rounded bg-[#567] px-3 py-2 text-xs font-bold"
                >
                  EDIT PROFILE
                </Link>
              )}
              {!isAuthor && currentUserId && (
                <button
                  onClick={handleFollow}
                  className="sans-serif text-p-white rounded bg-[#567] px-3 py-2 text-xs font-bold hover:bg-[#456]"
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            <p className="sans-serif text-sh-grey hidden py-2 text-xs md:block">
              {user.bio}
            </p>
          </div>
        </div>

        <p className="sans-serif text-sh-grey py-2 text-xs md:hidden">
          {user.bio}
        </p>
      </div>
      <div className="flex p-3">
        <div className="text-p-white flex flex-col items-center justify-center px-3">
          <h1 className=" text-2xl font-bold">{user?.favourites?.length}</h1>
          <p className=" sans-serif text-xs ">FAVOURITES</p>
        </div>
        <div className="text-p-white flex flex-col items-center justify-center border-l border-solid border-[#6677884f] px-3">
          <h1 className="text-2xl font-bold">{user?.ateAt?.length}</h1>
          <p className="sans-serif text-xs">ATE AT</p>
        </div>
      </div>
    </div>
  );
};
