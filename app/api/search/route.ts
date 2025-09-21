import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || searchParams.get('q');
  const location = searchParams.get('location') || 'Waterloo, Kitchener, ON, Canada';
  
  if (!query || query.length < 3) {
    return NextResponse.json({ error: 'Query must be at least 3 characters' }, { status: 400 });
  }

  const TTL_DAYS = parseInt(process.env.SEARCH_CACHE_TTL_DAYS || '7');
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
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&radius=75000&types=restaurant&key=${googleApiKey}`
    );

    if (!googleRes.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch from Google Places API' 
      }, { status: 500 });
    }

    const json = await googleRes.json();
    
    if (json.status !== 'OK') {
      return NextResponse.json({ 
        error: 'Search failed' 
      }, { status: 500 });
    }

    const results = json.predictions.map((prediction: any) => ({
      place_id: prediction.place_id,
      name: prediction.structured_formatting?.main_text || prediction.description,
      address: prediction.structured_formatting?.secondary_text || '',
      description: prediction.description
    }));

    // Skip caching and counter increment for now
    // TODO: Re-enable once Firebase is properly configured

    return NextResponse.json({ 
      source: 'google', 
      results 
    });

  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function to get monthly usage (reused from place API)
async function getMonthlyUsage(): Promise<number> {
  try {
    const brokeBoyRef = doc(db, 'broke_boy_monitor', 'monthly_usage');
    const brokeBoySnap = await getDoc(brokeBoyRef);
    
    if (brokeBoySnap.exists()) {
      const data = brokeBoySnap.data();
      const currentMonth = new Date().toISOString().slice(0, 7);
      
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

// Helper function to increment broke boy limitation counter (reused from place API)
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
