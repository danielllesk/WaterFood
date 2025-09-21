"use client";
import { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import Link from 'next/link';

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchFeed(user.uid);
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const fetchFeed = async (uid) => {
    try {
      const res = await fetch(`/api/feed?userId=${uid}`);
      const data = await res.json();
      setFeed(data.feed || []);
      if (data.feed.length === 0) {
        fetchTrending();
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const res = await fetch('/api/trending');
      const data = await res.json();
      setTrending(data.trending || []);
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!userId) return <div>Please log in to view your feed.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feed</h1>
      {feed.length > 0 ? (
        <div>
          {feed.map((event) => (
            <div key={event.id} className="border-b py-2">
              <p>{event.summary}</p>
              <Link href={`/restaurant/${event.place_id}`} className="text-blue-500">
                View Restaurant
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p>No recent posts from friends — here's what's trending in Waterloo.</p>
          <div>
            {trending.map((restaurant) => (
              <div key={restaurant.id} className="border-b py-2">
                <Link href={`/restaurant/${restaurant.place_id}`} className="text-blue-500">
                  {restaurant.name}
                </Link>
                <p>App Rating: {restaurant.appRating}/5 ({restaurant.appRatingsTotal} reviews)</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
