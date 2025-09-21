import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, runTransaction, arrayUnion, arrayRemove, collection } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, userId, action } = body; // action: 'add' or 'remove'

    if (!restaurantId || !userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: 'Action must be add or remove' }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnap.data();
      const favorites = userData.favourites || [];
      const userName = userData.name || 'Someone';

      // Get restaurant data for feed
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const restaurantSnap = await transaction.get(restaurantRef);
      const restaurantData = restaurantSnap.exists() ? restaurantSnap.data() : {};
      const restaurantName = restaurantData.name || 'a restaurant';

      if (action === 'add') {
        // Check if already in favorites
        const alreadyExists = favorites.some((item: any) => item.restaurantID === restaurantId);
        
        if (!alreadyExists) {
          // Check if user already has 4 favorites (limit)
          if (favorites.length >= 4) {
            throw new Error('Maximum of 4 favorites allowed');
          }

          transaction.update(userRef, {
            favourites: arrayUnion({
              restaurantID: restaurantId,
              timestamp: new Date().toISOString()
            })
          });

          // Add to feed
          const feedDocRef = doc(collection(db, 'feed'));
          transaction.set(feedDocRef, {
            type: 'favorite_update',
            userId,
            place_id: restaurantId,
            timestamp: new Date(),
            summary: `${userName} added ${restaurantName} to favorites`,
            metadata: {}
          });

          // Update restaurant weekly stats
          const restaurantRef = doc(db, 'restaurants', restaurantId);
          const restaurantSnap = await transaction.get(restaurantRef);
          
          if (restaurantSnap.exists()) {
            const restaurantData = restaurantSnap.data();
            const weeklyStats = restaurantData.weeklyStats || { logs: 0, reviews: 0, favorites: 0 };
            
            transaction.update(restaurantRef, {
              weeklyStats: {
                ...weeklyStats,
                favorites: weeklyStats.favorites + 1,
                lastUpdated: new Date()
              }
            });
          }
        }
      } else if (action === 'remove') {
        // Remove from favorites
        const itemToRemove = favorites.find((item: any) => item.restaurantID === restaurantId);
        
        if (itemToRemove) {
          transaction.update(userRef, {
            favourites: arrayRemove(itemToRemove)
          });

          // Update restaurant weekly stats (decrement)
          const restaurantRef = doc(db, 'restaurants', restaurantId);
          const restaurantSnap = await transaction.get(restaurantRef);
          
          if (restaurantSnap.exists()) {
            const restaurantData = restaurantSnap.data();
            const weeklyStats = restaurantData.weeklyStats || { logs: 0, reviews: 0, favorites: 0 };
            
            transaction.update(restaurantRef, {
              weeklyStats: {
                ...weeklyStats,
                favorites: Math.max(0, weeklyStats.favorites - 1),
                lastUpdated: new Date()
              }
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating favorites:', error);
    
    if (error instanceof Error && error.message === 'Maximum of 4 favorites allowed') {
      return NextResponse.json({ 
        error: 'Maximum of 4 favorites allowed' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update favorites' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();
    const favourites = userData.favourites || [];

    return NextResponse.json({ favourites });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch favorites' 
    }, { status: 500 });
  }
}
