import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ClinicService } from '../../types';
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Settings, 
  Activity, 
  Search, 
  Edit3, 
  Plus, 
  Trash2, 
  Save, 
  Download,
  Stethoscope,
  HeartPulse,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    doctors, 
    appointments, 
    clinicServices, 
    clinicInfo, 
    updateClinicInfo, 
    addToast,
    refreshAllData 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'services' | 'clinic_info'>('overview');
  
  // Search & Filters for Appointments
  const [aptSearch, setAptSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Clinic Info Edit State
  const [infoForm, setInfoForm] = useState({
    name: clinicInfo?.name || 'Zahid Clinic',
    tagline: clinicInfo?.tagline || 'Medical Consultation & Treatment Services',
    phone: clinicInfo?.phone || '+92 300 1234567',
    email: clinicInfo?.email || 'contact@zahidclinic.com',
    address: clinicInfo?.address || '33-S-20 ST NO 2 Sunny View Park Ramgarh Mughalpura Lahore',
    emergencyContact: clinicInfo?.emergencyContact || '+92 321 7654321',
    mission: clinicInfo?.mission || ''
  });

  // Services Edit / Add
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    department: 'Cardiology',
    description: '',
    iconName: 'Activity',
    priceRange: '$120 - $250'
  });

  const totalRevenue = appointments
    .filter(a => a.status === 'accepted' || a.status === 'completed')
    .reduce((sum, a) => sum + (a.fee || 150), 0);

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = 
      a.patientName.toLowerCase().includes(aptSearch.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(aptSearch.toLowerCase()) ||
      a.reasonForVisit.toLowerCase().includes(aptSearch.toLowerCase());
    
    const matchesDoctor = doctorFilter === 'All' || a.doctorId === doctorFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;

    return matchesSearch && matchesDoctor && matchesStatus;
  });

  const handleSaveClinicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateClinicInfo(infoForm);
      if (res.success && res.clinic) {
        updateClinicInfo(res.clinic);
        addToast({
          type: 'success',
          title: 'Clinic Information Saved',
          message: 'Public clinic details & emergency contacts have been updated.'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createService(newService);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Specialty Service Created',
          message: `${newService.title} has been added to public services.`
        });
        setShowServiceModal(false);
        setNewService({ title: '', department: 'Cardiology', description: '', iconName: 'Activity', priceRange: '$120 - $250' });
        await refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const res = await api.deleteService(serviceId);
      if (res.success) {
        addToast({
          type: 'info',
          title: 'Service Removed',
          message: 'The clinical service was deleted.'
        });
        await refreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ appointments, doctors, clinicServices }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `zahid_clinic_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      type: 'success',
      title: 'Export Generated',
      message: 'Platform telemetry & appointments exported to JSON.'
    });
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-7 h-7 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Clinic Administration & Governance Hub
                </h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Oversee doctors, appointments, revenue analytics, clinical disciplines, and public clinic information.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportData}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Data</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-400" />
            <span>Platform Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'appointments' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>All Appointments ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'services' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-teal-400" />
            <span>Clinical Services ({clinicServices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clinic_info')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'clinic_info' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-teal-400" />
            <span>Clinic Settings & Content</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase">Total Bookings</span>
                  <Calendar className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-3xl font-black text-slate-900">{appointments.length}</div>
                <p className="text-[11px] text-slate-500 mt-1">Across all specialist calendars</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase">Active Specialists</span>
                  <Stethoscope className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="text-3xl font-black text-cyan-700">{doctors.filter(d => d.isActive).length}</div>
                <p className="text-[11px] text-slate-500 mt-1">{doctors.length} total staff profiles</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase">Consultation Volume</span>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">Rs. {totalRevenue.toLocaleString()}</div>
                <p className="text-[11px] text-slate-500 mt-1">Confirmed & completed care (PKR)</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold uppercase">Pending Triage</span>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-600">
                  {appointments.filter(a => a.status === 'pending').length}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Awaiting physician review</p>
              </div>
            </div>

            {/* Doctor Load Overview Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Doctor Caseload & Availability
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Doctor Name</th>
                      <th className="py-3 px-4">Specialty</th>
                      <th className="py-3 px-4">Total Appointments</th>
                      <th className="py-3 px-4">Fee (PKR)</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctors.map(doc => {
                      const docApts = appointments.filter(a => a.doctorId === doc.id);
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <img src={doc.avatar} alt={doc.name} className="w-7 h-7 rounded-full object-cover" />
                            <span>{doc.name}</span>
                          </td>
                          <td className="py-3 px-4 text-teal-700 font-medium">{doc.specialization}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{docApts.length}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">Rs. {doc.consultationFee?.toLocaleString()}</td>
                          <td className="py-3 px-4 text-amber-500 font-bold">★ {doc.rating}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              doc.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {doc.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: APPOINTMENTS PIPELINE */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Platform Master Appointments Table
                </h3>
                <p className="text-xs text-slate-500">Search and audit all historical patient appointments.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search patient, doctor..."
                    value={aptSearch}
                    onChange={e => setAptSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <select
                  value={doctorFilter}
                  onChange={e => setDoctorFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                >
                  <option value="All">All Doctors</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                >
                  <option value="All">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="reschedule_proposed">Reschedule Proposed</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Master Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Chief Complaint</th>
                    <th className="py-3 px-4">Fee</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>{apt.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{apt.patientPhone || apt.patientEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {apt.doctorName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{apt.date}</div>
                        <div className="text-[10px] text-slate-500">{apt.time}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {apt.reasonForVisit}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>Rs. {apt.fee?.toLocaleString()} PKR</div>
                        {apt.paymentMethod && (
                          <div className="text-[10px] text-slate-500 uppercase">{apt.paymentMethod}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          apt.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          apt.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          apt.status === 'reschedule_proposed' ? 'bg-indigo-100 text-indigo-800' :
                          apt.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {apt.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CLINIC SERVICES MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Clinical Services & Disciplines
                </h3>
                <p className="text-xs text-slate-500">Configure medical departments displayed on the public landing page.</p>
              </div>

              <button
                onClick={() => setShowServiceModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Specialty Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinicServices.map(srv => (
                <div key={srv.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-teal-700 uppercase">{srv.department}</span>
                      <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">{srv.priceRange}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{srv.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{srv.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-end">
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CLINIC INFO & SETTINGS */}
        {activeTab === 'clinic_info' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Clinic Contact & Public Content Settings</h3>
              <p className="text-xs text-slate-500">Update clinic branding, phone number, address, and mission statement.</p>
            </div>

            <form onSubmit={handleSaveClinicInfo} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  required
                  value={infoForm.name}
                  onChange={e => setInfoForm({ ...infoForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mission Statement / Overview</label>
                <textarea
                  rows={3}
                  value={infoForm.mission}
                  onChange={e => setInfoForm({ ...infoForm, mission: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Main Phone</label>
                  <input
                    type="text"
                    value={infoForm.phone}
                    onChange={e => setInfoForm({ ...infoForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Public Email</label>
                  <input
                    type="email"
                    value={infoForm.email}
                    onChange={e => setInfoForm({ ...infoForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Physical Address</label>
                <input
                  type="text"
                  value={infoForm.address}
                  onChange={e => setInfoForm({ ...infoForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Hotlines & Guidelines</label>
                <input
                  type="text"
                  value={infoForm.emergencyContact}
                  onChange={e => setInfoForm({ ...infoForm, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Public Content</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* Add Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Clinical Discipline</h3>
            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Preventive Cardiology Screenings"
                  value={newService.title}
                  onChange={e => setNewService({ ...newService, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology, Neurology"
                  value={newService.department}
                  onChange={e => setNewService({ ...newService, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Comprehensive diagnostic description..."
                  value={newService.description}
                  onChange={e => setNewService({ ...newService, description: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price Range / Estimate</label>
                <input
                  type="text"
                  placeholder="$100 - $200"
                  value={newService.priceRange}
                  onChange={e => setNewService({ ...newService, priceRange: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
