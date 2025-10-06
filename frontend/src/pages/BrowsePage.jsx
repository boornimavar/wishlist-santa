import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import apiService from '../services/api';

function BrowsePage({ currentUser, onNavigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiService.users.getAll();
      const filteredUsers = response.data.users.filter(u => u.id !== currentUser.id);
      setUsers(filteredUsers);
    } catch (error) {
      setError('Failed to load users');
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (userId) => {
    try {
      const response = await apiService.users.getById(userId);
      onNavigate('userProfile', response.data.user);
    } catch (error) {
      alert('Failed to load user profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-red-600">🎅 Wishlist Santa</h1>
            <button
              onClick={() => onNavigate('profile')}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              My Profile
            </button>
          </div>
        </nav>
        <div className="flex items-center justify-center py-16">
          <div className="text-xl text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">🎅 Wishlist Santa</h1>
          <button
            onClick={() => onNavigate('profile')}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            My Profile
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Browse User Wishlists</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            <p>No other users yet. Invite your friends to join!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleUserClick(user.id)}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={24} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-gray-600">@{user.username}</p>
                  {user.about && (
                    <p className="text-sm text-gray-500 mt-2">{user.about}</p>
                  )}
                  <div className="mt-4">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {user.event_count || 0} events
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowsePage;