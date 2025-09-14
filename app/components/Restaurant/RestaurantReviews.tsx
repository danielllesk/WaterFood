"use client";
import React, { useEffect, useState } from "react";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { createReviewPopup, PopupAction } from "../../utils";
import { RestaurantReviewCompact } from "../Review/RestaurantReviewCompact";
import moment from "moment";
import { Review } from "app/types";

export const RestaurantReviews = ({ restaurant }) => {
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);

  const submitReview = async (e: any, review: string) => {
    e.preventDefault();

    if (!review || !auth.currentUser) {
      createReviewPopup(PopupAction.ERROR);
      return;
    }

    try {
      await saveUserReview();
      await saveMovieReview();
    } catch (err) {
      console.error("Error saving review:", err);
    } finally {
      fetchReviewsByMovie(); // Refetch reviews
      setReview(""); // Cleanup input
    }
  };

  /**
   * Saves the review for the user which has posted it
   */
  const saveUserReview = async () => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      reviews: arrayUnion({
        restaurantID: restaurant.id,
        review: review,
        timestamp: getDate(),
      }),
    });
  };

  /**
   * Checks if a restaurant is already stored in DB and saves the review or restaurant + review
   */
  const saveMovieReview = async () => {
    try {
      const restaurantDoc = await getDoc(doc(db, "restaurants/" + restaurant.id));

      if (restaurantDoc.exists()) {
        // Add review to existing restaurant
        await addMovieReview();
      } else {
        // Create a new restaurant document with the review
        await addNewMovieDocWithReview();
      }
    } catch (err) {
      console.error("Error saving restaurant review:", err);
    }
  };

  /**
   * Adds a review on the restaurant which already exists in the db
   */
  const addMovieReview = async () => {
    if (!auth.currentUser) return;

    const restaurantRef = doc(db, "restaurants/" + restaurant.id);

    try {
      await updateDoc(restaurantRef, {
        reviews: arrayUnion({
          restaurantID: restaurant.id,
          userName: auth.currentUser.displayName,
          userURL: auth.currentUser.photoURL,
          review: review,
          uid: auth.currentUser.uid,
          timestamp: getDate(),
        }),
      });

      createReviewPopup(PopupAction.SUCCESS);
    } catch (err) {
      console.error("Error updating restaurant review:", err);
    }
  };

  const addNewMovieDocWithReview = async () => {
    if (!auth.currentUser) return;

    try {
      await setDoc(doc(db, "restaurants/" + restaurant.id), {
        reviews: [
          {
            restaurantID: restaurant.id,
            review: review,
            userName: auth.currentUser.displayName,
            userURL: auth.currentUser.photoURL,
            uid: auth.currentUser.uid,
            timestamp: getDate(),
          },
        ],
      });
    } catch (err) {
      console.error("Error creating new restaurant document with review:", err);
    }
  };

  const fetchReviewsByMovie = async () => {
    const restaurantDoc = await getDoc(doc(db, "restaurants/" + restaurant.id));
    if (!restaurantDoc.exists()) {
      setReviews([]);
      return;
    }
    const restaurantReviews = restaurantDoc.data().reviews;
    if (!restaurantReviews) {
      setReviews([]);
      return;
    }

    setReviews(restaurantReviews);
  };

  const handleDelete = async (review) => {
    // On the user document, we only store minimal info, and we need a ref. to that to delete as well
    const userProfileReview = {
      restaurantID: review.restaurantID,
      review: review.review,
      timestamp: review.timestamp,
    };

    const restaurantRef = doc(db, "restaurants", review.restaurantID.toString());
    const userRef = doc(db, "users", review.uid);

    await updateDoc(restaurantRef, {
      reviews: arrayRemove(review),
    })
      .then(() => {
        createReviewPopup(PopupAction.REMOVED);
        fetchReviewsByMovie();
      })
      .catch((err) => {
        console.error(err);
        createReviewPopup(PopupAction.ERROR);
      });

    await updateDoc(userRef, {
      reviews: arrayRemove(userProfileReview),
    }).catch((err) => {
      console.error(err);
    });
  };

  const getDate = () => {
    return moment().format("DD.MM.YYYY");
  };
  useEffect(() => {
    fetchReviewsByMovie();
  }, []);

  return (
    <div className="mt-3 flex w-full flex-col justify-between gap-2 md:ml-[6.5rem] md:w-[50%]">
      {reviews.length > 0
        ? reviews.map((r, i) => (
            <RestaurantReviewCompact
              key={i}
              review={r}
              handleDelete={handleDelete}
            />
          ))
        : ""}

      {!reviews.length && auth && (
        <p className="text-sh-grey pt-2 text-base">Write the first review!</p>
      )}

      {!review.length && !auth && (
        <p className="text-sh-grey pt-2 text-base">
          Login and write the first review!
        </p>
      )}

      {/* REVIEW FORM */}
      {auth && (
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => submitReview(e, review)}
        >
          <textarea
            className="active-outline-none bg-h-grey text-drop-black rounded p-3 focus:outline-none"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <button
            type="submit"
            className="bg-c-grey text-l-white hover:bg-sh-grey hover:text-b-blue rounded p-1 text-base"
          >
            Send Review
          </button>
        </form>
      )}
    </div>
  );
};
