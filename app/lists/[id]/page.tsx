"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { auth } from '../../firebase/firebase';
import { LayoutNavbar } from '../../components/Navigation/LayoutNavbar';
import { Footer } from '../../components/Navigation/Footer';
import { PopularRestaurantPoster } from '../../components/Home/PopularRestaurantPoster';
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

export default function ListDetailPage() {
  const params = useParams();
  const listId = params.id as string;
  
  const [list, setList] = useState<RestaurantList | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (listId) {
      fetchList();
    }
  }, [listId]);

  const fetchList = async () => {
    try {
      const res = await fetch(`/api/lists/${listId}`);
      const data = await res.json();
      setList(data.list);
    } catch (error) {
      console.error('Error fetching list:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!list) return <div>List not found</div>;

  const isOwner = userId === list.userId;

  return (
    <>
      <LayoutNavbar />
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">{list.name}</h1>
          <p className="text-gray-300 mb-4">{list.description}</p>
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>By {list.userName}</span>
            <span>{list.restaurants.length} restaurants</span>
          </div>
        </div>

        {isOwner && (
          <div className="mb-6">
            <Link 
              href={`/lists/${listId}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
            >
              Edit List
            </Link>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
              Delete List
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {list.restaurants.map((restaurant) => (
            <div key={restaurant.id} className="relative">
              <PopularRestaurantPoster 
                restaurant={restaurant} 
                compact={true}
              />
            </div>
          ))}
        </div>

        {list.restaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No restaurants in this list yet.</p>
            {isOwner && (
              <p className="text-gray-500 text-sm mt-2">
                Add restaurants by visiting their pages and using the "Add to List" button.
              </p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
