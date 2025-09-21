import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc, runTransaction, collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, userId, rating, reviewText, userName, userPhotoUrl } = body;

    if (!restaurantId || !userId || !rating || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    const result = await runTransaction(db, async (transaction) => {
      // Create review document
      const reviewRef = doc(collection(db, 'reviews'));
      const reviewData = {
        restaurantId,
        userId,
        userName,
        userPhotoUrl: userPhotoUrl || null,
        rating: Number(rating),
        review: reviewText || '',
        timestamp: new Date(),
        createdAt: new Date()
      };

      // Get current restaurant data
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const restaurantSnap = await transaction.get(restaurantRef);

      if (!restaurantSnap.exists()) {
        throw new Error('Restaurant not found');
      }

      const restaurantData = restaurantSnap.data();
      const currentAppRating = restaurantData.appRating || 0;
      const currentAppRatingsTotal = restaurantData.appRatingsTotal || 0;

      // Calculate new aggregated rating
      const newTotal = currentAppRatingsTotal + 1;
      const newAppRating = ((currentAppRating * currentAppRatingsTotal) + Number(rating)) / newTotal;

      // Update restaurant with new aggregated rating
      transaction.update(restaurantRef, {
        appRating: newAppRating,
        appRatingsTotal: newTotal,
        lastUpdated: new Date()
      });

      // Add review to reviews collection
      transaction.set(reviewRef, reviewData);

      // Add to feed
      const feedDocRef = doc(collection(db, 'feed'));
      const restaurantName = restaurantData.name || 'a restaurant';
      transaction.set(feedDocRef, {
        type: 'review',
        userId,
        place_id: restaurantId,
        timestamp: new Date(),
        summary: `${userName} reviewed ${restaurantName}`,
        metadata: { reviewId: reviewRef.id, rating: Number(rating), reviewText: reviewText || '' }
      });

      // Update user's reviews array
      const userRef = doc(db, 'users', userId);
      const userSnap = await transaction.get(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const userReviews = userData.reviews || [];
        
        // Check if user already reviewed this restaurant
        const existingReviewIndex = userReviews.findIndex((r: any) => r.restaurantID === restaurantId);
        
        if (existingReviewIndex >= 0) {
          // Update existing review
          userReviews[existingReviewIndex] = {
            restaurantID: restaurantId,
            review: reviewText || '',
            rating: Number(rating),
            timestamp: new Date().toISOString()
          };
        } else {
          // Add new review
          userReviews.push({
            restaurantID: restaurantId,
            review: reviewText || '',
            rating: Number(rating),
            timestamp: new Date().toISOString()
          });
        }

        transaction.update(userRef, {
          reviews: userReviews
        });
      }

      return {
        reviewId: reviewRef.id,
        newAppRating,
        newAppRatingsTotal: newTotal
      };
    });

    return NextResponse.json({
      success: true,
      reviewId: result.reviewId,
      newAppRating: result.newAppRating,
      newAppRatingsTotal: result.newAppRatingsTotal
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ 
      error: 'Failed to create review' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId');
  const userId = searchParams.get('userId');

  try {
    if (restaurantId) {
      // Get reviews for a specific restaurant
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = await getDocs(
        query(reviewsRef, where('restaurantId', '==', restaurantId), orderBy('timestamp', 'desc'))
      );
      
      const reviews = reviewsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return NextResponse.json({ reviews });
    }

    if (userId) {
      // Get reviews by a specific user
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = await getDocs(
        query(reviewsRef, where('userId', '==', userId), orderBy('timestamp', 'desc'))
      );
      
      const reviews = reviewsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return NextResponse.json({ reviews });
    }

    return NextResponse.json({ error: 'restaurantId or userId required' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reviews' 
    }, { status: 500 });
  }
}
