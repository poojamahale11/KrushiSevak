import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CropAreaData } from './pages/CropAreaData';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { KrushiSevaKendra } from './pages/KrushiSevaKendra';
import { Marketplace } from './pages/Marketplace';
import { About } from './pages/About';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { StoreOwnerDashboard } from './pages/StoreOwnerDashboard';
import { NotFound } from './pages/NotFound';
import { AgriAssistant } from './pages/AgriAssistant';
import { Feedback } from './pages/Feedback';
import { Notifications } from './pages/Notifications';

export const App = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Navigation Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/crop-area-data" element={<ProtectedRoute allowedRoles={['farmer','customer']}><CropAreaData /></ProtectedRoute>} />
          <Route path="/disease-detection" element={<ProtectedRoute allowedRoles={['farmer']}><DiseaseDetection /></ProtectedRoute>} />
          <Route path="/krushi-seva-kendra" element={<KrushiSevaKendra />} />
          <Route path="/marketplace" element={<ProtectedRoute allowedRoles={['farmer','customer']}><Marketplace /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/agri-assistant" element={<AgriAssistant />} />
          <Route path="/feedback" element={<ProtectedRoute allowedRoles={['farmer','customer','storeOwner']}><Feedback /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute allowedRoles={['farmer','customer','storeOwner']}><Notifications /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Explicit role-based authentication entry points */}
          <Route path="/login/farmer" element={<Navigate to="/login?role=farmer" replace />} />
          <Route path="/login/customer" element={<Navigate to="/login?role=customer" replace />} />
          <Route path="/login/store-owner" element={<Navigate to="/login?role=storeOwner" replace />} />

          <Route path="/register/farmer" element={<Navigate to="/register?role=farmer" replace />} />
          <Route path="/register/customer" element={<Navigate to="/register?role=customer" replace />} />
          <Route path="/register/store-owner" element={<Navigate to="/register?role=storeOwner" replace />} />

          {/* Role-Protected Dashboards */}
          <Route
            path="/dashboard/farmer"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/customer"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/store-owner"
            element={
              <ProtectedRoute allowedRoles={['storeOwner']}>
                <StoreOwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};
