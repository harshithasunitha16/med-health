import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { ArrowLeft, FileType, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export const PatientUpload: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'prescription' | 'report'>('report');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !profile) return;

    setLoading(true);
    setError('');

    try {
      // 1. Upload to Storage
      const storageRef = ref(storage, `records/${profile.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(snapshot.ref);

      // 2. Save metadata to Firestore
      await addDoc(collection(db, 'records'), {
        patientId: profile.uid,
        fileURL,
        fileName: file.name,
        type,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => navigate('/patient/timeline'), 1500);
    } catch (err) {
      console.error('Upload failed', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-24 pb-12">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Upload Record</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100"
      >
        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${
              file ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,image/*"
            />
            {file ? (
              <>
                <CheckCircle2 size={40} className="text-green-600" />
                <p className="mt-2 text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </>
            ) : (
              <>
                <Upload size={40} className="text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900">Tap to select a file</p>
                <p className="text-xs text-gray-400">PDF or Images (Max 5MB)</p>
              </>
            )}
          </div>

          {/* Type Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Record Type</label>
            <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl">
              <button
                id="type-prescription"
                type="button"
                onClick={() => setType('prescription')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all ${
                  type === 'prescription' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileType size={18} />
                Prescription
              </button>
              <button
                id="type-report"
                type="button"
                onClick={() => setType('report')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all ${
                  type === 'report' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileType size={18} />
                Report
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-600">
              <CheckCircle2 size={18} />
              Record uploaded successfully! Redirecting...
            </div>
          )}

          <button
            id="upload-submit"
            type="submit"
            disabled={loading || !file || success}
            className="flex w-full items-center justify-center rounded-2xl bg-blue-600 py-4 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Save Record'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
