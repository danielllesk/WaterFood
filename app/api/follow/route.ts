import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc, runTransaction, arrayUnion, arrayRemove } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetUserId, userId, action } = body; // action: 'follow' or 'unfollow'

    if (!targetUserId || !userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['follow', 'unfollow'].includes(action)) {
      return NextResponse.json({ error: 'Action must be follow or unfollow' }, { status: 400 });
    }

    if (targetUserId === userId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnap.data();
      const following = userData.following || [];

      if (action === 'follow') {
        // Check if already following
        const alreadyFollowing = following.includes(targetUserId);
        
        if (!alreadyFollowing) {
          transaction.update(userRef, {
            following: arrayUnion(targetUserId)
          });
        }
      } else if (action === 'unfollow') {
        // Check if following
        const isFollowing = following.includes(targetUserId);
        
        if (isFollowing) {
          transaction.update(userRef, {
            following: arrayRemove(targetUserId)
          });
        }
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating following:', error);
    return NextResponse.json({ 
      error: 'Failed to update following' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const targetUserId = searchParams.get('targetUserId');

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
    const following = userData.following || [];

    if (targetUserId) {
      // Check if following specific user
      const isFollowing = following.includes(targetUserId);
      return NextResponse.json({ isFollowing });
    } else {
      // Return all following
      return NextResponse.json({ following });
    }

  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch following' 
    }, { status: 500 });
  }
}
