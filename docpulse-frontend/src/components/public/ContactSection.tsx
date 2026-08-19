import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building,
  Car,
  ExternalLink,
  ShieldCheck,
  Video,
  Home
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { clinicInfo, addToast, startBookingWithDoctor } = useApp();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    consultationMode: 'Clinic Visit',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    addToast({
      type: 'success',
      title: 'Inquiry Received',
      message: 'Dr. Zahid Hussain & Zahid Clinic coordination team will follow up promptly.'
    });
  };

  const clinicAddress = clinicInfo?.address || '33-S-20 ST NO 2 Sunny View Park Ramgarh Mughalpura Lahore';
  const mapsUrl = clinicInfo?.googleMapsUrl || 'https://maps.google.com/?q=33-S-20+ST+NO+2+Sunny+View+Park+Ramgarh+Mughalpura+Lahore';

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-3 py-1 rounded-full border border-teal-200">
            Contact & Location Details
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Zahid Clinic — Mughalpura Lahore
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Visit Dr. Zahid Hussain in-person, request a home visit, or connect via 24/7 online consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Contact Info & Google Maps Card */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone / WhatsApp</h4>
                <p className="text-xs font-bold text-slate-900">{clinicInfo?.phone || '+92 300 1234567'}</p>
                <p className="text-[11px] text-slate-500">Direct clinic desk</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Opening Hours</h4>
                <p className="text-xs font-bold text-slate-900">Clinic: 4:00 PM – 12:00 AM</p>
                <p className="text-[11px] text-emerald-600 font-semibold">Online: 24/7 Worldwide</p>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Clinic Address</h4>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-relaxed">
                    {clinicAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
                <Building className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Doctor In-Charge</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <strong>Dr. Zahid Hussain</strong> (MBBS, FCPS Internal Medicine) — Consultant Physician
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps Location Preview Card */}
            <div className="bg-[#39393A] rounded-3xl p-6 text-white border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-white">Google Maps Location</span>
                </div>
                <span className="text-[10px] text-teal-300 font-semibold bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                  Open 4pm - 12am Daily
                </span>
              </div>

              <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2 animate-bounce">
                  <MapPin className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-100">Zahid Clinic</p>
                <p className="text-[11px] text-slate-300 max-w-sm mt-0.5">
                  33-S-20 ST NO 2 Sunny View Park Ramgarh Mughalpura Lahore
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Direct Consultation Inquiry</h3>
              <p className="text-xs text-slate-500 mb-6">
                Have questions regarding treatment, home visits, or clinic timings? Fill in the details below.
              </p>

              {isSubmitted ? (
                <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">Inquiry Dispatched</h4>
                  <p className="text-xs text-slate-600">
                    Thank you, {form.name}. Your note has been forwarded to Zahid Clinic. We will respond promptly.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setForm({ name: '', email: '', phone: '', consultationMode: 'Clinic Visit', message: '' });
                    }}
                    className="text-xs text-teal-700 font-bold underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Usman Tariq"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. usman@gmail.com"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / Mobile (Pakistan)</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0300-1234567"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Interested Consultation Mode</label>
                    <select
                      value={form.consultationMode}
                      onChange={e => setForm({ ...form, consultationMode: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50"
                    >
                      <option value="Clinic Visit">🏥 Clinic Visit (4:00 PM – 12:00 AM)</option>
                      <option value="Online Consultation">💬 Online Chat Consultation (24/7)</option>
                      <option value="Home Visit">🏠 Home Visit (At Your Residence)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Description of Condition / Query</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe symptoms or query (e.g. Neurological symptoms, Blood pressure check, Diabetes management)..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message to Zahid Clinic</span>
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => startBookingWithDoctor()}
                      className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
                    >
                      Or proceed directly to Slot Booking &rarr;
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
