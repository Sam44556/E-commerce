import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Home,
  Package,
  Info,
  LogOut,
  Settings
} from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { to: '/product', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { to: '/about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              ShopHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button variant="ghost" className="text-base">
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  0
                </Badge>
              </Button>
            </Link>

            {isLoggedIn ? (
              <>
                {userRole === 'admin' && (
                  <Link to="/admin">
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/account">
                  <Button variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/account">
                <Button>
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 border-t animate-in slide-in-from-top-5">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-base">
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Button>
              </Link>
            ))}

            <Link to="/cart" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-base">
                <ShoppingCart className="w-4 h-4" />
                <span className="ml-2">Cart</span>
                <Badge className="ml-auto">0</Badge>
              </Button>
            </Link>

            <div className="border-t pt-2 mt-2">
              {isLoggedIn ? (
                <>
                  {userRole === 'admin' && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-base">
                        <Settings className="w-4 h-4" />
                        <span className="ml-2">Admin Dashboard</span>
                      </Button>
                    </Link>
                  )}
                  <Link to="/account" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-base">
                      <User className="w-4 h-4" />
                      <span className="ml-2">My Account</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-base text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="ml-2">Logout</span>
                  </Button>
                </>
              ) : (
                <Link to="/account" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Login / Sign Up
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
