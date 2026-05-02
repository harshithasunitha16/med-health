import { Upload, Clock, Share2, User, ShieldCheck, Activity, Zap, TrendingUp } from 'lucide-react';
import { Reminders } from '../components/Reminders';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

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
    <div className="mx-auto max-w-lg px-4 pt-24 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Profile Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-800 p-8 text-white shadow-2xl shadow-blue-500/30">
          <div className="absolute right-[-20px] top-[-20px] h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute left-[-20px] bottom-[-20px] h-32 w-32 rounded-full bg-blue-400/20 blur-3xl"></div>
          
          <div className="relative flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md ring-1 ring-white/30">
              <User size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{profile.name}</h2>
                <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
              </div>
              <p className="text-xs font-medium text-blue-100/60">{profile.email}</p>
              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
                  {profile.bloodGroup || 'O+'}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
                  {profile.age || '25'} Yrs
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <motion.div 
            whileHover={{ y: -4 }}
            className="rounded-[2.5rem] bg-white p-6 shadow-sm border border-gray-100 overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
              <Activity size={48} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Medical Logs</p>
            <p className="mt-1 text-3xl font-display font-bold text-gray-900">12</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -4 }}
            className="rounded-[2.5rem] bg-gray-900 p-6 shadow-xl shadow-gray-200 overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform text-white">
              <Zap size={48} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Health Aura</p>
            <p className="mt-1 text-3xl font-display font-bold text-white italic">A+</p>
          </motion.div>
        </div>

        {/* Reminders Section */}
        <div className="rounded-[2.5rem] bg-white p-6 shadow-sm border border-gray-100">
          <Reminders />
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] bg-white p-10 shadow-sm border border-gray-100 relative group">
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Vault ID</span>
          </div>
          <div className="rounded-3xl border-8 border-gray-50 bg-white p-6 shadow-inner transition-transform group-hover:scale-[1.02]">
            <QRCodeSVG 
              value={`${window.location.origin}/doctor/patient/${profile.uid}`} 
              size={180}
              level="H"
            />
          </div>
          <div className="mt-6 flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{profile.uid}</span>
            <p className="text-[10px] text-gray-400">Scan to share medical history safely</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            id="upload-record-link"
            to="/patient/upload"
            className="flex flex-col items-center gap-3 rounded-[2.5rem] bg-white p-7 shadow-sm border border-gray-100 transition-all hover:bg-gray-50 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Upload size={24} />
            </div>
            <span className="text-sm font-bold text-gray-900">Upload</span>
          </Link>

          <Link
            id="view-timeline-link"
            to="/patient/timeline"
            className="flex flex-col items-center gap-3 rounded-[2.5rem] bg-white p-7 shadow-sm border border-gray-100 transition-all hover:bg-gray-50 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-lg shadow-gray-300">
              <Clock size={24} />
            </div>
            <span className="text-sm font-bold text-gray-900">History</span>
          </Link>
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between rounded-[2.5rem] bg-white p-8 shadow-sm border border-gray-100 text-left">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${profile.sharingEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Share2 size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Public Protocol</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {profile.sharingEnabled ? 'Broadcasting: ON' : 'Broadcasting: OFF'}
              </p>
            </div>
          </div>
          <button
            id="toggle-sharing-button"
            onClick={toggleSharing}
            disabled={loading}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ring-4 ring-offset-2 ring-transparent active:ring-blue-500/10 ${
              profile.sharingEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
                profile.sharingEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
