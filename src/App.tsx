import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import MyOrdersPage from './pages/MyOrdersPage';
import DashboardPage from './pages/DashboardPage';
import ContactPage from './pages/ContactPage';
import ShippingInfoPage from './pages/ShippingInfoPage';
import ReturnsPage from './pages/ReturnsPage';
import FAQPage from './pages/FAQPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { CartProvider } from './context/CartContext';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#10B981',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />

          <Routes>
            {/* Auth Routes - No Header/Footer */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Contact & Info Routes - With Header/Footer */}
            <Route path="/contact" element={
              <>
                <Header />
                <ContactPage />
                <Footer />
              </>
            } />
            <Route path="/shipping-info" element={
              <>
                <Header />
                <ShippingInfoPage />
                <Footer />
              </>
            } />
            <Route path="/returns" element={
              <>
                <Header />
                <ReturnsPage />
                <Footer />
              </>
            } />
            <Route path="/faq" element={
              <>
                <Header />
                <FAQPage />
                <Footer />
              </>
            } />
            <Route path="/privacypolicy" element={
              <>
                <Header />
                <PrivacyPolicyPage />
                <Footer />
              </>
            } />
            
            {/* Main Routes - With Header/Footer */}
            <Route path="/" element={
              <>
                <Header />
                <HomePage />
                <Footer />
              </>
            } />
            <Route path="/cart" element={
              <>
                <Header />
                <CartPage />
                <Footer />
              </>
            } />
            <Route path="/checkout" element={
              <>
                <Header />
                <CheckoutPage />
                <Footer />
              </>
            } />
            <Route path="/order-success/:orderId" element={
              <>
                <Header />
                <OrderSuccessPage />
                <Footer />
              </>
            } />
            <Route path="/my-orders" element={
              <>
                <Header />
                <MyOrdersPage />
                <Footer />
              </>
            } />
            <Route path="/dashboard" element={
              <>
                <Header />
                <DashboardPage />
                <Footer />
              </>
            } />
            <Route path="/product/:id" element={
              <>
                <Header />
                <ProductDetailPage />
                <Footer />
              </>
            } />
            <Route path="/about" element={
              <>
                <Header />
                <AboutPage />
                <Footer />
              </>
            } />
            <Route path="/products" element={
              <>
                <Header />
                <ProductsPage />
                <Footer />
              </>
            } />
            
            {/* 404 Not Found Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;