import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../firebase/firebase';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    // Get user's following
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();
    const following = userData.following || [];

    if (following.length === 0) {
      return NextResponse.json({ feed: [], message: 'No following yet' });
    }

    // Query feed where userId in following, ordered by timestamp desc, limit 50
    const feedRef = collection(db, 'feed');
    const feedQuery = query(
      feedRef,
      where('userId', 'in', following),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const feedSnap = await getDocs(feedQuery);
    const feed = feedSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ feed });

  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch feed' 
    }, { status: 500 });
  }
}
