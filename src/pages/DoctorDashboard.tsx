import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, QrCode, ArrowRight, UserCheck, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { QRScanner } from '../components/QRScanner';

export const DoctorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      navigate(`/doctor/patient/${patientId.trim()}`);
    }
  };

  const handleScan = (decodedText: string) => {
    // If it's a full URL, extract the ID
    if (decodedText.includes('/doctor/patient/')) {
      const id = decodedText.split('/doctor/patient/').pop();
      if (id) navigate(`/doctor/patient/${id}`);
    } else {
      navigate(`/doctor/patient/${decodedText}`);
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
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-2xl shadow-blue-500/20 group">
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl transition-transform group-hover:scale-110"></div>
          <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl"></div>
          
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-4 group-hover:scale-110 transition-transform">
              <Stethoscope size={24} />
            </div>
            <p className="text-sm font-medium text-blue-100 mb-1">Medical Portal Active</p>
            <h2 className="text-3xl font-bold tracking-tight">Dr. {profile.name}</h2>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200/80">{profile.degree} • Verified Professional</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            className="rounded-[2rem] bg-white p-6 border border-gray-100 shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Patients Seen</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 tracking-tight">42</p>
            <div className="mt-2 h-1 w-12 rounded-full bg-blue-500"></div>
          </motion.div>
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            className="rounded-[2rem] bg-white p-6 border border-gray-100 shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Avg. Scans</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 tracking-tight">8</p>
            <div className="mt-2 h-1 w-16 rounded-full bg-green-500"></div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.button
            id="open-scanner-button"
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowScanner(true)}
            className="group flex w-full items-center justify-between rounded-[2.5rem] bg-gray-900 p-7 shadow-xl shadow-gray-200 transition-all hover:bg-black"
          >
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white group-hover:bg-blue-500 transition-colors">
                <QrCode size={28} />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-lg">Instant Scan</p>
                <p className="text-xs text-gray-500">Open camera for Patient QR</p>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white">
              <ArrowRight size={20} />
            </div>
          </motion.button>

          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-gray-100 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UserCheck size={20} />
              </div>
              <h3 className="font-bold text-gray-900 tracking-tight text-lg">Search by ID</h3>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <input
                  id="patient-id-input"
                  type="text"
                  placeholder="Enter Patient ID..."
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-4 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <button
                id="search-patient-button"
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-900 py-4 text-sm font-semibold text-white transition-all hover:bg-black active:scale-[0.98]"
              >
                View Patient Records
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showScanner && (
          <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};
