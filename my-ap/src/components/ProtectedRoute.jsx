import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useProvider } from '../context/provider';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
        return <Navigate to="/account" state={{ from: location }} replace />;
    }

    if (adminOnly && userRole !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
