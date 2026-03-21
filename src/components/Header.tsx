import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Leaf, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getCurrentUser, signOut } from '../lib/auth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Define TypeScript interfaces
interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  image_url?: string;
  link?: string;
}

interface UserData {
  full_name: string;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchAnnouncements();
  }, []);

  const checkUser = async () => {
    const { user: currentUser } = await getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      // Fetch user's full name from users table
      const { data, error } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', currentUser.id)
        .single();
      
      if (!error && data) {
        setUserName((data as UserData).full_name);
      } else {
        setUserName(currentUser.email?.split('@')[0] || 'User');
      }
    }
  };

  const fetchAnnouncements = async () => {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('global_messages')
      .select('*')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setAnnouncements(data as Announcement[]);
      
      // Check unread announcements (store read status in localStorage)
      const readAnnouncements = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
      const unread = (data as Announcement[]).filter(a => !readAnnouncements.includes(a.id)).length;
      setUnreadCount(unread);
    }
  };

  const markAsRead = (announcementId: string) => {
    const readAnnouncements = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
    if (!readAnnouncements.includes(announcementId)) {
      readAnnouncements.push(announcementId);
      localStorage.setItem('readAnnouncements', JSON.stringify(readAnnouncements));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = () => {
    const allIds = announcements.map(a => a.id);
    localStorage.setItem('readAnnouncements', JSON.stringify(allIds));
    setUnreadCount(0);
  };

  const handleAnnouncementClick = (announcement: Announcement) => {
    markAsRead(announcement.id);
    if (announcement.link) {
      window.open(announcement.link, '_blank');
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      setUser(null);
      setUserName('');
      setIsUserMenuOpen(false);
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-full">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">NaturZen</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
                Home
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
                Products
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
                About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
                Contact
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center max-w-md mx-4 flex-1">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button
                onClick={() => setIsNotificationPanelOpen(true)}
                className="relative p-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
                >
                  <User className="h-6 w-6" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b">
                          {userName}
                        </div>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/my-orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
              >
                <ShoppingCart className="h-6 w-6" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-700"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-4 py-2">
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                
                <nav className="space-y-2">
                  <Link
                    to="/"
                    className="block py-2 text-gray-700 hover:text-green-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/products"
                    className="block py-2 text-gray-700 hover:text-green-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link
                    to="/about"
                    className="block py-2 text-gray-700 hover:text-green-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className="block py-2 text-gray-700 hover:text-green-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Right Side Notification Panel */}
      {isNotificationPanelOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
            onClick={() => setIsNotificationPanelOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="flex items-center space-x-2">
                  <Bell className="h-6 w-6" />
                  <h2 className="text-xl font-semibold">Announcements</h2>
                </div>
                <div className="flex items-center space-x-2">
                  {announcements.length > 0 && unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-white hover:text-green-100 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotificationPanelOpen(false)}
                    className="p-1 hover:bg-green-600 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {/* Announcements List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No announcements at the moment</p>
                  </div>
                ) : (
                  announcements.map((announcement) => {
                    const readAnnouncements = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
                    const isRead = readAnnouncements.includes(announcement.id);
                    return (
                      <div
                        key={announcement.id}
                        onClick={() => handleAnnouncementClick(announcement)}
                        className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          !isRead ? 'border-green-300 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        {announcement.image_url && (
                          <div className="mb-3">
                            <img 
                              src={announcement.image_url} 
                              alt={announcement.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-semibold mb-1 ${!isRead ? 'text-green-700' : 'text-gray-900'}`}>
                              {announcement.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {announcement.message}
                            </p>
                            {announcement.link && (
                              <span className="text-green-600 text-sm inline-flex items-center">
                                Click to view →
                              </span>
                            )}
                          </div>
                          {!isRead && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;