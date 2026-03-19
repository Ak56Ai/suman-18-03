import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, CreditCard, Settings, Package, Heart, Bell, ShoppingBag } from 'lucide-react';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import ProfileSection from '../components/dashboard/ProfileSection';
import AddressSection from '../components/dashboard/AddressSection';
import TransactionHistory from '../components/dashboard/TransactionHistory';
import PasswordSection from '../components/dashboard/PasswordSection';
import WishlistSection from '../components/dashboard/WishlistSection';
import NotificationSection from '../components/dashboard/NotificationSection';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0, 
    savedAddresses: 0,
    unreadNotifications: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error('Please login to access dashboard');
        return;
      }

      setUser(user);

      // Load user profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      } else {
        setUserProfile(profile);
      }

      // Get orders count
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id);

      // Get wishlist count
      const { data: wishlist } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id);

      // Get addresses count
      const { data: addresses } = await supabase
        .from('user_addresses')
        .select('id')
        .eq('user_id', user.id);

      // Get unread notifications count
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_read', false);

      setStats({
        totalOrders: orders?.length || 0,
        wishlistItems: wishlist?.length || 0,
        savedAddresses: addresses?.length || 0,
        unreadNotifications: notifications?.length || 0,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Settings },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'transactions', name: 'Transactions', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'password', name: 'Password', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="bg-gray-300 rounded-lg h-64"></div>
              <div className="lg:col-span-3 bg-gray-300 rounded-lg h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {userProfile?.full_name || user?.email}! Manage your account and preferences.
            </p>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saved Addresses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.savedAddresses}</p>
                </div>
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unreadNotifications}</p>
                </div>
                <Bell className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-100 text-green-700 border-l-4 border-green-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6"
            >
              {/* Overview Content */}
              {activeTab === 'overview' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Account Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Orders:</span>
                          <span className="font-semibold">{stats.totalOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Wishlist Items:</span>
                          <span className="font-semibold">{stats.wishlistItems}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Saved Addresses:</span>
                          <span className="font-semibold">{stats.savedAddresses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unread Notifications:</span>
                          <span className="font-semibold">{stats.unreadNotifications}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setActiveTab('profile')}
                          className="w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Update Profile
                        </button>
                        <button
                          onClick={() => setActiveTab('addresses')}
                          className="w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          Manage Addresses
                        </button>
                        <button
                          onClick={() => setActiveTab('wishlist')}
                          className="w-full text-left px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          View Wishlist
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'profile' && (
                <ProfileSection 
                  user={user} 
                  userProfile={userProfile} 
                  onProfileUpdate={setUserProfile}
                />
              )}
              {activeTab === 'addresses' && (
                <AddressSection userId={user?.id} />
              )}
              {/* Wishlist Section */}
              {activeTab === 'wishlist' && (
                <WishlistSection user={user} />
              )}
              {activeTab === 'transactions' && (
                <TransactionHistory userId={user?.id} />
              )}
              {/* Notifications Section */}
              {activeTab === 'notifications' && (
                <NotificationSection user={user} onUpdate={loadUserData} />
              )}
              {activeTab === 'password' && (
                <PasswordSection />
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;