import React, { useState, useEffect } from 'react';
import apiService from './services/api';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import BrowsePage from './pages/BrowsePage';
import UserProfilePage from './pages/UserProfilePage';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [viewingUser, setViewingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await apiService.auth.checkAuth();
      if (response.data.authenticated) {
        setCurrentUser(response.data.user);
        setCurrentPage('profile');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await apiService.auth.login({ username, password });
      setCurrentUser(response.data.user);
      setCurrentPage('profile');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await apiService.auth.register(userData);
      setCurrentUser(response.data.user);
      setCurrentPage('profile');
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.auth.logout();
      setCurrentUser(null);
      setCurrentPage('home');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    if (data) {
      setViewingUser(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentPage === 'home' && !currentUser && (
        <HomePage onLogin={handleLogin} onRegister={handleRegister} />
      )}
      
      {currentPage === 'profile' && currentUser && (
        <ProfilePage 
          currentUser={currentUser} 
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />
      )}
      
      {currentPage === 'browse' && currentUser && (
        <BrowsePage 
          currentUser={currentUser}
          onNavigate={navigateTo}
        />
      )}
      
      {currentPage === 'userProfile' && viewingUser && (
        <UserProfilePage 
          currentUser={currentUser}
          viewingUser={viewingUser}
          onNavigate={navigateTo}
        />
      )}
    </div>
  );
}

export default App;