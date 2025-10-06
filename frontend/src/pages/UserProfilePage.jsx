import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import apiService from '../services/api';
import EventCard from '../components/EventCard';

function UserProfilePage({ currentUser, viewingUser, onNavigate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [viewingUser]);

  const fetchUserProfile = async () => {
    try {
      const response = await apiService.users.getById(viewingUser.id);
      setEvents(response.data.events || []);
    } catch (error) {
      setError('Failed to load user profile');
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (wishId) => {
    try {
      await apiService.wishes.reserve(wishId);
      await fetchUserProfile();
    } catch (error) {
      alert('Failed to reserve wish: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-red-600">🎅 Wishlist Santa</h1>
          </div>
        </nav>
        <div className="flex items-center justify-center py-16">
          <div className="text-xl text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">🎅 Wishlist Santa</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => onNavigate('browse')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Browse
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              My Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">{viewingUser?.name}</h2>
            <p className="text-gray-600">@{viewingUser?.username}</p>
            {viewingUser?.age && <p className="text-gray-600">Age: {viewingUser.age}</p>}
            {viewingUser?.about && <p className="text-gray-600 mt-2">{viewingUser.about}</p>}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold">Upcoming Events & Wishlists</h3>
          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              <p>{viewingUser?.name} hasn't created any events yet.</p>
            </div>
          ) : (
            events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isOwner={false}
                onReserve={handleReserve}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;