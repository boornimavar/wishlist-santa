import React, { useState } from 'react';

function HomePage({ onLogin, onRegister }) {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
  username: '',
  email: '',      
  password: '',
  name: '',
  age: '',
  about: ''
});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await onLogin(loginData.username, loginData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await onRegister(registerData);
    
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Wishlist Santa</h1>
          <p className="text-xl text-gray-600 mb-8">
            Create wishlists for your special days and let friends reserve gifts anonymously!
          </p>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 px-4 text-center font-medium ${
                activeTab === 'login' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              } rounded-l-lg`}
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2 px-4 text-center font-medium ${
                activeTab === 'register' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              } rounded-r-lg`}
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 border rounded-lg"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded-lg"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
              <button
                type="submit"
                className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                className="w-full p-3 border rounded-lg"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                required
              />

              <input
  type="email"
  placeholder="Email"
  className="w-full p-3 border rounded-lg"
  value={registerData.email}
  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
  required
/>

              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 border rounded-lg"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Age"
                className="w-full p-3 border rounded-lg"
                value={registerData.age}
                onChange={(e) => setRegisterData({ ...registerData, age: e.target.value })}
              />
              <textarea
                placeholder="About yourself"
                className="w-full p-3 border rounded-lg"
                rows="3"
                value={registerData.about}
                onChange={(e) => setRegisterData({ ...registerData, about: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded-lg"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
              />
              <button
                type="submit"
                className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;