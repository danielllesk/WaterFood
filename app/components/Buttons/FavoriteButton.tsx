import React, { Dispatch, SetStateAction } from "react";
import { doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import favIcon from "./fav.png";
import removeFavIcon from "./remFav.png";
import Image from "next/image";
import { auth, db } from "../../firebase/firebase";
import { createFavouritePopup, PopupAction } from "../../utils";

export const FavouriteButton = ({
  id,
  title,
  isFavourite,
  setIsFavourite,
  onEvent,
}: {
  id: string;
  title: string;
  isFavourite: boolean;
  setIsFavourite: Dispatch<SetStateAction<boolean>>;
  onEvent?: () => void;
}) => {
  const onFavourite = async () => {
    onEvent && onEvent();

    if (isFavourite) {
      return await removeFromFavsDB();
    } else {
      return await addToFavsDB();
    }
  };

  const addToFavsDB = async () => {
    if (!auth || !auth.currentUser) {
      createFavouritePopup(title, PopupAction.ERROR);
      return;
    }

    const userId = auth.currentUser.uid;

    try {
      const response = await fetch('/api/favorites', {
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
        setIsFavourite(true);
        createFavouritePopup(title, PopupAction.FAVOURITE);
      } else {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'Maximum of 4 favorites allowed') {
          createFavouritePopup('Maximum of 4 favorites allowed', PopupAction.ERROR);
        } else {
          createFavouritePopup(title, PopupAction.ERROR);
        }
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      createFavouritePopup(title, PopupAction.ERROR);
    }
  };

  const removeFromFavsDB = async () => {
    if (!auth || !auth.currentUser) {
      createFavouritePopup(title, PopupAction.ERROR);
      return;
    }

    const userId = auth.currentUser.uid;

    try {
      const response = await fetch('/api/favorites', {
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
        setIsFavourite(false);
        createFavouritePopup(title, PopupAction.REMOVED);
      } else {
        createFavouritePopup(title, PopupAction.ERROR);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      createFavouritePopup(title, PopupAction.ERROR);
    }
  };

  return (
    <>
      <div className="p-2" onClick={onFavourite}>
        <Image
          src={isFavourite ? removeFavIcon : favIcon}
          width={20}
          height={20}
          alt={
            isFavourite
              ? "Remove restaurant from favorites icon"
              : "Add restaurant to favorites icon"
          }
          aria-label={
            isFavourite
              ? "Remove restaurant from favorites list"
              : "Add restaurant to favorites list"
          }
        />
      </div>
    </>
  );
};

export default FavouriteButton;
