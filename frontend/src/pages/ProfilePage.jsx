import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, User, Users, LogOut, Settings } from 'lucide-react';
import apiService from '../services/api';
import CalendarView from '../components/CalendarView';
import EventCard from '../components/EventCard';
import Modal from '../components/Modal';

function ProfilePage({ currentUser, onNavigate, onLogout }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalData, setModalData] = useState({
    eventTitle: '',
    wishDescription: '',
    wishLink: ''
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    age: currentUser?.age || '',
    about: currentUser?.about || ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setProfileData({
      name: currentUser?.name || '',
      age: currentUser?.age || '',
      about: currentUser?.about || ''
    });
  }, [currentUser]);

  const fetchEvents = async () => {
    try {
      const response = await apiService.events.getAll();
      setEvents(response.data.events);
    } catch (error) {
      setError('Failed to load events');
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventTitleChange = useCallback((e) => {
    setModalData(prev => ({ ...prev, eventTitle: e.target.value }));
  }, []);

  const handleWishDescriptionChange = useCallback((e) => {
    setModalData(prev => ({ ...prev, wishDescription: e.target.value }));
  }, []);

  const handleWishLinkChange = useCallback((e) => {
    setModalData(prev => ({ ...prev, wishLink: e.target.value }));
  }, []);

  const handleAddEvent = async () => {
    if (!modalData.eventTitle || !selectedDate) return;

    try {
      await apiService.events.create({
        title: modalData.eventTitle,
        date: selectedDate
      });
      
      await fetchEvents();
      setModalData({ ...modalData, eventTitle: '' });
      setShowModal(null);
      setSelectedDate(null);
    } catch (error) {
      alert('Failed to create event: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleAddWish = async (eventId) => {
    if (!modalData.wishDescription) return;

    try {
      await apiService.wishes.add(eventId, {
        description: modalData.wishDescription,
        link: modalData.wishLink
      });
      
      await fetchEvents();
      setModalData({ ...modalData, wishDescription: '', wishLink: '' });
      setShowModal(null);
    } catch (error) {
      alert('Failed to add wish: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await apiService.events.delete(eventId);
      await fetchEvents();
    } catch (error) {
      alert('Failed to delete event: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleDeleteWish = async (wishId) => {
    if (!window.confirm('Are you sure you want to delete this wish?')) return;

    try {
      await apiService.wishes.delete(wishId);
      await fetchEvents();
    } catch (error) {
      alert('Failed to delete wish: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await apiService.users.updateProfile(profileData);
      
      alert('Profile updated successfully! Refresh page to see changes.');
      setShowEditProfile(false);
    } catch (error) {
      alert('Failed to update profile: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleDateClick = (dateString) => {
    setSelectedDate(dateString);
    setShowModal('addEvent');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">🎅 Wishlist Santa</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('browse')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
            >
              <Users size={16} />
              <span>Browse Users</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut size={16} />
              <span>Logout</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">My Profile</h2>
                <Settings 
                  size={20} 
                  className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" 
                  onClick={() => setShowEditProfile(true)}
                  title="Edit Profile"
                />
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-red-600" />
                </div>
                <h3 className="font-semibold text-lg">{currentUser?.name}</h3>
                <p className="text-gray-600">@{currentUser?.username}</p>
                {currentUser?.age && <p className="text-gray-600">Age: {currentUser.age}</p>}
                {currentUser?.about && <p className="text-gray-600 mt-2">{currentUser.about}</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <Calendar className="mr-2" size={20} />
                  My Events Calendar
                </h2>
              </div>
              
              <CalendarView
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                events={events}
                onDateClick={handleDateClick}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">My Events</h3>
              {events.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                  <p>No events yet. Click on a date in the calendar to create your first event!</p>
                </div>
              ) : (
                events.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isOwner={true}
                    onAddWish={() => setShowModal(`addWish-${event.id}`)}
                    onDeleteEvent={handleDeleteEvent}
                    onDeleteWish={handleDeleteWish}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditProfile && (
        <Modal title="Edit Profile" onClose={() => setShowEditProfile(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full p-3 border rounded-lg"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                placeholder="Your age"
                className="w-full p-3 border rounded-lg"
                value={profileData.age}
                onChange={(e) => setProfileData({...profileData, age: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
              <textarea
                placeholder="Tell us about yourself"
                className="w-full p-3 border rounded-lg"
                rows="3"
                value={profileData.about}
                onChange={(e) => setProfileData({...profileData, about: e.target.value})}
              />
            </div>
            <button
              onClick={handleUpdateProfile}
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {showModal === 'addEvent' && (
        <Modal title="Add New Event" onClose={() => setShowModal(null)}>
          <div className="space-y-4">
            <p className="text-gray-600">Date: {selectedDate}</p>
            <input
              type="text"
              placeholder="Event title (e.g., Birthday Party)"
              className="w-full p-3 border rounded-lg"
              value={modalData.eventTitle}
              onChange={handleEventTitleChange}
              autoFocus
            />
            <button
              onClick={handleAddEvent}
              className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600"
            >
              Create Event
            </button>
          </div>
        </Modal>
      )}

      {showModal && showModal.startsWith('addWish-') && (
        <Modal title="Add New Wish" onClose={() => setShowModal(null)}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="What do you want?"
              className="w-full p-3 border rounded-lg"
              value={modalData.wishDescription}
              onChange={handleWishDescriptionChange}
              autoFocus
            />
            <input
              type="url"
              placeholder="Link (optional)"
              className="w-full p-3 border rounded-lg"
              value={modalData.wishLink}
              onChange={handleWishLinkChange}
            />
            <button
              onClick={() => handleAddWish(parseInt(showModal.split('-')[1]))}
              className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
            >
              Add Wish
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ProfilePage;