import React from 'react';
import { Store, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Store className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">ECommerce</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Your one-stop shop for quality products. We provide excellent customer service 
              and fast shipping to make your shopping experience exceptional.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm">contact@ecommerce.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-300 hover:text-white transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-300 hover:text-white transition-colors">
                  Register
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-300">Help Center</span>
              </li>
              <li>
                <span className="text-gray-300">Shipping Info</span>
              </li>
              <li>
                <span className="text-gray-300">Returns</span>
              </li>
              <li>
                <span className="text-gray-300">Contact Us</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 ECommerce. All rights reserved. Built with Django & React.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;