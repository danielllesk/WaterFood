import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, runTransaction, arrayUnion, arrayRemove, collection } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, userId, action, notes } = body; // action: 'add' or 'remove'

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
      const ateAt = userData.ateAt || [];
      const userName = userData.name || 'Someone';

      // Get restaurant data for feed
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const restaurantSnap = await transaction.get(restaurantRef);
      const restaurantData = restaurantSnap.exists() ? restaurantSnap.data() : {};
      const restaurantName = restaurantData.name || 'a restaurant';

      if (action === 'add') {
        // Check if already in ate at list
        const alreadyExists = ateAt.some((item: any) => item.restaurantID === restaurantId);
        
        if (!alreadyExists) {
          transaction.update(userRef, {
            ateAt: arrayUnion({
              restaurantID: restaurantId,
              timestamp: new Date().toISOString(),
              notes: notes || ''
            })
          });

          // Add to feed
          const feedDocRef = doc(collection(db, 'feed'));
          transaction.set(feedDocRef, {
            type: 'log',
            userId,
            place_id: restaurantId,
            timestamp: new Date(),
            summary: `${userName} ate at ${restaurantName}`,
            metadata: { notes: notes || '' }
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
                logs: weeklyStats.logs + 1,
                lastUpdated: new Date()
              }
            });
          }
        }
      } else if (action === 'remove') {
        // Remove from ate at list
        const itemToRemove = ateAt.find((item: any) => item.restaurantID === restaurantId);
        
        if (itemToRemove) {
          transaction.update(userRef, {
            ateAt: arrayRemove(itemToRemove)
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
                logs: Math.max(0, weeklyStats.logs - 1),
                lastUpdated: new Date()
              }
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating ate at log:', error);
    return NextResponse.json({ 
      error: 'Failed to update ate at log' 
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
    const ateAt = userData.ateAt || [];

    return NextResponse.json({ ateAt });

  } catch (error) {
    console.error('Error fetching ate at logs:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch ate at logs' 
    }, { status: 500 });
  }
}
