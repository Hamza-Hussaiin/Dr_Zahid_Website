import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { TimeSlot } from '../../types';
import { api } from '../../services/api';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  ArrowLeft, 
  Sparkles,
  RefreshCw,
  Layers
} from 'lucide-react';

export const SlotManager: React.FC = () => {
  const { user, doctorProfile } = useAuth();
  const { setCurrentView, addToast } = useApp();

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'booked' | 'blocked'>('all');
  
  // New Slot Form
  const [newStartTime, setNewStartTime] = useState('09:00 AM');
  const [newEndTime, setNewEndTime] = useState('09:30 AM');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const docId = doctorProfile?.id || user?.id || 'doc_1';

  const loadDoctorSlots = async () => {
    try {
      const res = await api.getSlots(docId);
      if (res.success && res.slots) {
        setSlots(res.slots);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDoctorSlots();
  }, [docId]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await api.createSlot({
        doctorId: docId,
        date: selectedDate,
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'available',
        isRecurring
      });

      if (res.success && res.slot) {
        setSlots(prev => [...prev, res.slot]);
        addToast({
          type: 'success',
          title: 'Slot Created',
          message: `Added ${selectedDate} (${newStartTime} - ${newEndTime}) to your schedule.`
        });
      }
    } catch (e) {
      console.error(e);
    }
    setIsCreating(false);
  };

  const handleToggleStatus = async (slot: TimeSlot) => {
    if (slot.status === 'booked') {
      addToast({
        type: 'warning',
        title: 'Slot Booked',
        message: 'Cannot toggle status of an active booked appointment slot.'
      });
      return;
    }
    const newStatus: 'available' | 'blocked' = slot.status === 'available' ? 'blocked' : 'available';
    try {
      const res = await api.updateSlot(slot.id, { status: newStatus });
      if (res.success) {
        setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, status: newStatus } : s));
        addToast({
          type: 'info',
          title: 'Slot Updated',
          message: `Slot is now ${newStatus}.`
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const res = await api.deleteSlot(slotId);
      if (res.success) {
        setSlots(prev => prev.filter(s => s.id !== slotId));
        addToast({
          type: 'info',
          title: 'Slot Removed',
          message: 'Calendar slot deleted.'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Quick Batch Generator (Creates 4 slots for the day)
  const handleGenerateStandardSlots = async () => {
    const defaultTimes = [
      { start: '09:00 AM', end: '09:30 AM' },
      { start: '10:00 AM', end: '10:30 AM' },
      { start: '02:00 PM', end: '02:30 PM' },
      { start: '03:30 PM', end: '04:00 PM' }
    ];

    let count = 0;
    for (const t of defaultTimes) {
      const res = await api.createSlot({
        doctorId: docId,
        date: selectedDate,
        startTime: t.start,
        endTime: t.end,
        status: 'available',
        isRecurring: false
      });
      if (res.success && res.slot) {
        setSlots(prev => [...prev, res.slot]);
        count++;
      }
    }

    addToast({
      type: 'success',
      title: 'Batch Schedule Created',
      message: `Generated ${count} consultation slots for ${selectedDate}.`
    });
  };

  const filteredSlots = slots.filter(s => {
    const matchesDate = s.date === selectedDate;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back navigation */}
        <button
          onClick={() => setCurrentView('doctor-dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctor Dashboard</span>
        </button>

        {/* Title */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-teal-600" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Manage Consultation Slots & Schedule
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Define your availability windows for patient online and in-clinic bookings.
            </p>
          </div>

          <button
            onClick={handleGenerateStandardSlots}
            className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs px-4 py-2.5 rounded-xl border border-teal-200 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Generate Standard Day Slots</span>
          </button>
        </div>

        {/* Main Grid: Add slot form + Slots display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Add New Slot Form */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Add Single Slot</span>
            </h3>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 AM"
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    placeholder="09:30 AM"
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurring-slot"
                  checked={isRecurring}
                  onChange={e => setIsRecurring(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <label htmlFor="recurring-slot" className="text-xs text-slate-600 cursor-pointer">
                  Weekly recurring availability
                </label>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-teal-400" />
                <span>{isCreating ? 'Adding...' : 'Add Slot to Schedule'}</span>
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p>• <strong>Available:</strong> Open for patients to book</p>
              <p>• <strong>Booked:</strong> Locked to an active patient case</p>
              <p>• <strong>Unavailable:</strong> Blocked for administrative time</p>
            </div>
          </div>

          {/* Right: Slots List for Selected Date */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Schedule for: {selectedDate}
                </h3>
                <p className="text-xs text-slate-500">{filteredSlots.length} slot(s) configured</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                    filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('available')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                    filterStatus === 'available' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => setFilterStatus('booked')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                    filterStatus === 'booked' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Booked
                </button>
              </div>
            </div>

            {/* Slots Grid */}
            {filteredSlots.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700">No slots defined for this date</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Use the form on the left or click "Generate Standard Day Slots".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredSlots.map(slot => (
                  <div
                    key={slot.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      slot.status === 'available'
                        ? 'bg-teal-50/60 border-teal-200'
                        : slot.status === 'booked'
                        ? 'bg-indigo-50/60 border-indigo-200'
                        : 'bg-slate-100 border-slate-200 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-teal-700" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                        slot.status === 'available' ? 'bg-teal-600 text-white' :
                        slot.status === 'booked' ? 'bg-indigo-600 text-white' :
                        'bg-slate-300 text-slate-700'
                      }`}>
                        {slot.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {slot.status !== 'booked' && (
                        <button
                          onClick={() => handleToggleStatus(slot)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          title={slot.status === 'available' ? 'Block Slot' : 'Unblock Slot'}
                        >
                          {slot.status === 'available' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      {slot.status !== 'booked' && (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          title="Delete Slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
