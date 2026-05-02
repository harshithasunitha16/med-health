import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, ExternalLink, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface MedicalRecord {
  id: string;
  type: 'prescription' | 'report';
  fileName: string;
  fileURL: string;
  createdAt: any;
}

export const PatientTimeline: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'prescription' | 'report'>('all');

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'records'),
      where('patientId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recordsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MedicalRecord[];
      setRecords(recordsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [profile]);

  const filteredRecords = records.filter(r => filter === 'all' || r.type === filter);

  return (
    <div className="mx-auto max-w-lg px-4 pt-24 pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Your Timeline</h1>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-1">
          {(['all', 'prescription', 'report'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-gray-50 py-20 text-center">
          <FileText size={48} className="text-gray-300" />
          <p className="mt-4 font-medium text-gray-500">No records found</p>
          <p className="text-sm text-gray-400">Records you upload will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm border border-gray-100"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
              }`}>
                <FileText size={24} />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    record.type === 'prescription' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {record.type}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Calendar size={12} />
                    {record.createdAt ? format(record.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}
                  </div>
                </div>
                <h3 className="mt-1 truncate font-semibold text-gray-900">{record.fileName}</h3>
                <a
                  href={record.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100"
                >
                  View Document
                  <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
