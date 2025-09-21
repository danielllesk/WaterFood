import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../firebase/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    // Query restaurants ordered by appRatingsTotal desc, limit 10
    const restaurantsRef = collection(db, 'restaurants');
    const trendingQuery = query(
      restaurantsRef,
      orderBy('appRatingsTotal', 'desc'),
      limit(10)
    );

    const trendingSnap = await getDocs(trendingQuery);
    const trending = trendingSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ trending });

  } catch (error) {
    console.error('Error fetching trending:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch trending' 
    }, { status: 500 });
  }
}
