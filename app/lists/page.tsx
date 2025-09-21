"use client";
import { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { LayoutNavbar } from '../components/Navigation/LayoutNavbar';
import { Footer } from '../components/Navigation/Footer';
import Link from 'next/link';

interface RestaurantList {
  id: string;
  name: string;
  description: string;
  userId: string;
  userName: string;
  restaurants: any[];
  createdAt: Date;
  isPublic: boolean;
}

export default function ListsPage() {
  const [lists, setLists] = useState<RestaurantList[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchLists();
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const fetchLists = async () => {
    try {
      const res = await fetch('/api/lists');
      const data = await res.json();
      setLists(data.lists || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <LayoutNavbar />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Restaurant Lists</h1>
          {userId && (
            <Link 
              href="/lists/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Create New List
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <div key={list.id} className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-2">{list.name}</h2>
              <p className="text-gray-300 mb-4">{list.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>By {list.userName}</span>
                <span>{list.restaurants.length} restaurants</span>
              </div>
              <div className="mt-4">
                <Link 
                  href={`/lists/${list.id}`}
                  className="text-blue-400 hover:text-blue-300"
                >
                  View List →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {lists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No lists found. Create the first one!</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
