/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch } from "react";
import { doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import watchIcon from "./watched.png";
import remWatched from "./remWatched.png";
import Image from "next/image";
import { auth, db } from "../../firebase/firebase";
import { createWatchedPopup, PopupAction } from "../../utils";

export const WatchButton = ({
  id,
  title,
  isWatched,
  setIsWatched,
  onEvent,
}: {
  id: string;
  title: string;
  isWatched: boolean;
  setIsWatched: Dispatch<React.SetStateAction<boolean>>;
  onEvent?: () => void;
}) => {
  const onWatched = async () => {
    onEvent && onEvent();

    if (isWatched) {
      await removeFromWatchedDB();
    } else {
      await addToWatchedDB();
    }
  };

  const addToWatchedDB = async () => {
    if (!auth || !auth.currentUser) {
      createWatchedPopup(title, PopupAction.ERROR);
      return;
    }

    const userId = auth.currentUser.uid;

    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: id,
          userId: userId,
          action: 'add'
        }),
      });

      if (response.ok) {
        setIsWatched(true);
        createWatchedPopup(title, PopupAction.WATCHED);
      } else {
        createWatchedPopup(title, PopupAction.ERROR);
      }
    } catch (error) {
      console.error('Error adding to ate at:', error);
      createWatchedPopup(title, PopupAction.ERROR);
    }
  };

  const removeFromWatchedDB = async () => {
    if (!auth || !auth.currentUser) {
      createWatchedPopup(title, PopupAction.ERROR);
      return;
    }

    const userId = auth.currentUser.uid;

    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: id,
          userId: userId,
          action: 'remove'
        }),
      });

      if (response.ok) {
        setIsWatched(false);
        createWatchedPopup(title, PopupAction.REMOVED);
      } else {
        createWatchedPopup(title, PopupAction.ERROR);
      }
    } catch (error) {
      console.error('Error removing from ate at:', error);
      createWatchedPopup(title, PopupAction.ERROR);
    }
  };

  return (
    <>
      <div onClick={onWatched} className="p-2">
        <Image
          src={isWatched ? remWatched : watchIcon}
          width={20}
          height={20}
          alt={
            isWatched
              ? "Remove restaurant from ate at icon"
              : "Add restaurant to ate at icon"
          }
          aria-label={
            isWatched
              ? "Remove restaurant from ate at list"
              : "Add restaurant to ate at list"
          }
        />
      </div>
    </>
  );
};
