import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: place_id } = await params;
  
  if (!place_id) {
    return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
  }

  const TTL_DAYS = parseInt(process.env.PLACE_DETAILS_TTL_DAYS || '30');
  const now = Date.now();

  try {
    // Skip caching for now to avoid Firebase connection issues
    // TODO: Re-enable caching once Firebase is properly configured
    
    // Check broke boy limitation before making external API call
    const safeLimit = parseInt(process.env.SAFE_MONTHLY_GOOGLE_REQUESTS || '9500');
    const currentUsage = 0; // Skip usage check for now
    
    if (currentUsage >= safeLimit) {
      return NextResponse.json({ 
        error: 'External API broke boy limitation reached — try later' 
      }, { status: 429 });
    }

    // Fetch from Google Places API
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json({ 
        error: 'Google Places API key not configured' 
      }, { status: 500 });
    }

    const googleRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,formatted_address,rating,user_ratings_total,photos,opening_hours,geometry&key=${googleApiKey}`
    );

    if (!googleRes.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch from Google Places API' 
      }, { status: 500 });
    }

    const json = await googleRes.json();
    
    if (json.status !== 'OK') {
      return NextResponse.json({ 
        error: 'Place not found' 
      }, { status: 404 });
    }

    const result = json.result;
    
    // Prepare restaurant data for Firestore
    const restaurantData = {
      name: result.name,
      address: result.formatted_address,
      googleRating: result.rating || 0,
      googleRatingsTotal: result.user_ratings_total || 0,
      appRating: 0,
      appRatingsTotal: 0,
      photos: result.photos?.map((photo: any) => photo.photo_reference) || [],
      location: {
        lat: result.geometry?.location?.lat,
        lng: result.geometry?.location?.lng
      },
      openingHours: result.opening_hours?.weekday_text || [],
      lastFetched: new Date(),
      createdAt: new Date(),
      weeklyStats: {
        logs: 0,
        reviews: 0,
        favorites: 0,
        lastUpdated: new Date()
      }
    };

    // Skip caching and counter increment for now
    // TODO: Re-enable once Firebase is properly configured

    return NextResponse.json({ 
      source: 'google', 
      ...restaurantData 
    });

  } catch (error) {
    console.error('Error in place API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function to get monthly usage (simplified implementation)
async function getMonthlyUsage(): Promise<number> {
  try {
    const brokeBoyRef = doc(db, 'broke_boy_monitor', 'monthly_usage');
    const brokeBoySnap = await getDoc(brokeBoyRef);
    
    if (brokeBoySnap.exists()) {
      const data = brokeBoySnap.data();
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      if (data.month === currentMonth) {
        return data.counters?.totalRequests || 0;
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting monthly usage:', error);
    return 0;
  }
}

// Helper function to increment broke boy limitation counter
async function incrementBrokeBoyLimitationCounter(increment: number): Promise<void> {
  try {
    const brokeBoyRef = doc(db, 'broke_boy_monitor', 'monthly_usage');
    const brokeBoySnap = await getDoc(brokeBoyRef);
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentUsage = brokeBoySnap.exists() && brokeBoySnap.data().month === currentMonth 
      ? brokeBoySnap.data().counters?.totalRequests || 0 
      : 0;
    
    await setDoc(brokeBoyRef, {
      month: currentMonth,
      counters: {
        totalRequests: currentUsage + increment
      }
    }, { merge: true });
  } catch (error) {
    console.error('Error incrementing broke boy limitation counter:', error);
  }
}
