import React, { useState, useEffect } from 'react';
import { collection, query, where, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Reminder {
  id: string;
  title: string;
  time: string;
  active: boolean;
}

export const Reminders: React.FC = () => {
  const { profile } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'reminders'), where('patientId', '==', profile.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder)));
    });
    return unsubscribe;
  }, [profile]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time || !profile) return;
    try {
      await addDoc(collection(db, 'reminders'), {
        patientId: profile.uid,
        title,
        time,
        active: true,
        createdAt: serverTimestamp(),
      });
      setTitle('');
      setTime('');
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'reminders', id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Reminders</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="overflow-hidden space-y-3 rounded-2xl bg-gray-50 p-4 border border-blue-100"
          >
            <input
              type="text"
              placeholder="e.g., Blood Pressure Medicine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              Add Reminder
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {reminders.length === 0 && !showAdd && (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
            No active reminders. Stay healthy!
          </div>
        )}
        {reminders.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{r.title}</p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock size={10} />
                  {r.time}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
