import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ArrowLeft, User, FileText, Lock, AlertCircle, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  sharingEnabled: boolean;
}

interface MedicalRecord {
  id: string;
  type: 'prescription' | 'report';
  fileName: string;
  fileURL: string;
  createdAt: any;
}

export const DoctorPatientView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const patientDoc = await getDoc(doc(db, 'users', id));
        if (!patientDoc.exists()) {
          setError('Patient not found');
          setLoading(false);
          return;
        }

        const patientData = patientDoc.data() as PatientProfile;
        setPatient(patientData);

        if (!patientData.sharingEnabled) {
          setLoading(false);
          return;
        }

        // Fetch records if sharing enabled
        const q = query(
          collection(db, 'records'),
          where('patientId', '==', id),
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
      } catch (err) {
        console.error('Error fetching patient data', err);
        setError('Unauthorized access or connection error');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center pt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-24 pb-12">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Patient Profile</h1>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-red-50 p-12 text-center text-red-600">
          <AlertCircle size={48} className="mb-4" />
          <p className="font-bold">{error}</p>
          <p className="mt-2 text-sm">Please verify the Patient ID or ask the patient for their QR code.</p>
        </div>
      ) : patient && !patient.sharingEnabled ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-gray-50 p-12 text-center text-gray-500">
          <Lock size={48} className="mb-4 text-gray-300" />
          <p className="font-bold text-gray-900 text-lg">Access Denied</p>
          <p className="mt-2 text-sm">This patient has disabled data sharing.</p>
          <p className="text-xs mt-1">Ask the patient to toggle 'Sharing Access' ON in their dashboard.</p>
        </div>
      ) : patient && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Patient Card */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <User size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">
                    {patient.bloodGroup}
                  </span>
                  <span className="text-xs text-gray-500">{patient.age} years • {patient.gender}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-green-50 p-3 text-green-700 text-xs font-medium">
              <Lock size={14} />
              Verified Patient Data • Access Authorized
            </div>
          </div>

          {/* Records List */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 pl-2">Medical History</h3>
            {records.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-400 text-sm italic">
                No medical records uploaded by this patient yet.
              </div>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm border border-gray-100"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                  }`}>
                    <FileText size={20} />
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
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
