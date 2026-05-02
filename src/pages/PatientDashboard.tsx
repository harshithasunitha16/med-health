import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Upload, Clock, Share2, User } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggleSharing = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        sharingEnabled: !profile.sharingEnabled,
      });
      await refreshProfile();
    } catch (error) {
      console.error('Failed to toggle sharing', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-lg px-4 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Profile Card */}
        <div className="flex items-center gap-4 rounded-3xl bg-blue-600 p-6 text-white shadow-lg overflow-hidden relative">
          <div className="absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-blue-500 opacity-20 blur-2xl"></div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-sm opacity-80">{profile.email}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider">Blood: {profile.bloodGroup}</p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
          <p className="mb-4 text-center text-sm font-medium text-gray-500">Your Medical ID</p>
          <div className="rounded-2xl border-4 border-gray-50 bg-white p-3 shadow-inner">
            <QRCodeSVG 
              value={`${window.location.origin}/doctor/patient/${profile.uid}`} 
              size={180}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="mt-4 text-center text-xs text-gray-400">Doctors can scan this to view your records</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            id="upload-record-link"
            to="/patient/upload"
            className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Upload size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700">Upload Record</span>
          </Link>

          <Link
            id="view-timeline-link"
            to="/patient/timeline"
            className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <Clock size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700">View Timeline</span>
          </Link>
        </div>

        {/* Sharing Toggle */}
        <div className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${profile.sharingEnabled ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <Share2 size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Sharing Access</p>
              <p className="text-xs text-gray-500">{profile.sharingEnabled ? 'Doctors can view your data' : 'Data access restricted'}</p>
            </div>
          </div>
          <button
            id="toggle-sharing-button"
            onClick={toggleSharing}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              profile.sharingEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                profile.sharingEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
