export interface UserReview {
  review: string;
  restaurantID: string;
  timestamp?: string;
}

export interface UserFavourite {
  restaurantID: string;
}

export interface UserAteAt {
  restaurantID: string;
}

export interface User {
  uid: string;
  name: string;
  bio: string;
  photoUrl: string;
  favourites: UserFavourite[];
  ateAt: UserAteAt[];
  reviews: UserReview[];
}

export interface Review {
  restaurantID: string;
  userName: string;
  uid: string;
  userURL: string;
  review: string;
  timestamp?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  googleRating: number;
  appRating: number;
  photos: string[];
  place_id: string;
}
