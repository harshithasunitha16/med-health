/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { HealthuChat } from './components/HealthuChat';

// Pages
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { PatientDashboard } from './pages/PatientDashboard';
import { PatientUpload } from './pages/PatientUpload';
import { PatientTimeline } from './pages/PatientTimeline';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { DoctorPatientView } from './pages/DoctorPatientView';

const DashboardRedirect = () => {
  const { profile } = useAuth();
  if (!profile) return <Navigate to="/onboarding" replace />;
  return <Navigate to={profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-gray-900 overflow-x-hidden">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Private Routes */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* Patient Routes */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute role="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/upload"
              element={
                <ProtectedRoute role="patient">
                  <PatientUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/timeline"
              element={
                <ProtectedRoute role="patient">
                  <PatientTimeline />
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute role="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patient/:id"
              element={
                <ProtectedRoute role="doctor">
                  <DoctorPatientView />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <HealthuChat />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
