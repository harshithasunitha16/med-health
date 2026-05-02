import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, QrCode, ArrowRight, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export const DoctorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [patientId, setPatientId] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      navigate(`/doctor/patient/${patientId.trim()}`);
    }
  };

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-lg px-4 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-blue-500 opacity-20 blur-2xl"></div>
          <p className="text-sm font-medium opacity-80">Welcome back,</p>
          <h2 className="text-2xl font-bold">Dr. {profile.name}</h2>
          <p className="mt-1 text-sm opacity-70">{profile.degree} • Medical Professional</p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserCheck size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Find Patient</h3>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Patient ID or QR Scan Link</label>
              <div className="relative">
                <input
                  id="patient-id-input"
                  type="text"
                  placeholder="Enter Patient ID..."
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <button
              id="search-patient-button"
              type="submit"
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              View Patient Records
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-4 text-center">
              <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <QrCode size={20} />
              </div>
              <p className="text-xs text-gray-400 text-left">
                Scanning a patient's QR code will automatically redirect you to their profile page.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
