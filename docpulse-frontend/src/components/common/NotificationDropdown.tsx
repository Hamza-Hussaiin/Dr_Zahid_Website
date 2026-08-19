import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CalendarClock, 
  MessageSquare, 
  Info,
  CheckCheck,
  ExternalLink
} from 'lucide-react';

export const NotificationDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const { 
    notifications, 
    handleMarkNotificationRead, 
    handleMarkAllNotificationsRead,
    openChat,
    setCurrentView,
    setSelectedAppointment,
    appointments
  } = useApp();

  const userNotifs = notifications.filter(n => !user || n.userId === user.id);

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment_accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'appointment_rejected':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'reschedule_proposed':
        return <CalendarClock className="w-4 h-4 text-amber-500" />;
      case 'chat_message':
        return <MessageSquare className="w-4 h-4 text-cyan-600" />;
      case 'appointment_request':
        return <Clock className="w-4 h-4 text-indigo-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleNotificationClick = (notif: any) => {
    handleMarkNotificationRead(notif.id);
    if (notif.type === 'chat_message' && notif.relatedAppointmentId) {
      openChat(notif.relatedAppointmentId);
      onClose();
    } else if (notif.relatedAppointmentId) {
      const targetApt = appointments.find(a => a.id === notif.relatedAppointmentId);
      if (targetApt) setSelectedAppointment(targetApt);
      
      if (user?.role === 'doctor' || user?.role === 'admin_doctor') {
        setCurrentView('doctor-dashboard');
      } else {
        setCurrentView('patient-dashboard');
      }
      onClose();
    }
  };

  return (
    <div 
      id="notification-dropdown-panel"
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</h4>
        </div>
        {userNotifs.some(n => !n.isRead) && (
          <button
            onClick={() => handleMarkAllNotificationsRead()}
            className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {userNotifs.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">No notifications yet</p>
          </div>
        ) : (
          userNotifs.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                !notif.isRead ? 'bg-teal-50/40' : ''
              }`}
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-white shadow-2xs border border-slate-200 shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-xs font-bold text-slate-900 truncate">{notif.title}</p>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-slate-400">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {notif.relatedAppointmentId && (
                    <span className="text-[10px] font-semibold text-teal-600 flex items-center gap-0.5">
                      View details <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400">Real-time clinical telemetry active</p>
      </div>
    </div>
  );
};
