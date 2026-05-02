import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';

export const Onboarding: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    age: '',
    gender: 'Other',
    bloodGroup: 'Unknown',
    address: '',
    degree: '',
  });

  useEffect(() => {
    if (profile?.onboarded) {
      const target = profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard';
      navigate(target);
    }
    const pendingRole = localStorage.getItem('pending_role') as 'patient' | 'doctor';
    if (pendingRole) setRole(pendingRole);
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const data = {
        uid: user.uid,
        email: user.email,
        name: formData.name,
        role: role,
        onboarded: true,
        ...(role === 'patient' ? {
          age: parseInt(formData.age),
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          address: formData.address,
          sharingEnabled: true,
        } : {
          degree: formData.degree,
          address: formData.address,
        })
      };

      // Use setDoc with merge: true to avoid issues if the document was partially created
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      await refreshProfile();
      localStorage.removeItem('pending_role');
      navigate(role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    } catch (error) {
      console.error('Onboarding failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-xl shadow-gray-200/50"
      >
        <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
        <p className="mt-2 text-gray-500">Tell us a bit more about yourself to get started.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="name-input"
                type="text"
                required
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {role === 'patient' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input
                      id="age-input"
                      type="number"
                      required
                      className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      id="gender-select"
                      className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <select
                    id="bloodgroup-select"
                    className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>O+</option>
                    <option>O-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                    <option>Unknown</option>
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">Degree / Qualification</label>
                <input
                  id="degree-input"
                  type="text"
                  required
                  placeholder="e.g. MBBS, MD"
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                id="address-input"
                required
                rows={3}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <button
            id="onboarding-submit"
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-2xl bg-blue-600 py-4 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
