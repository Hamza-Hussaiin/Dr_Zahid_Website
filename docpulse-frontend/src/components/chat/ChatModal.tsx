import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ChatMessage } from '../../types';
import { DEFAULT_AVATAR } from '../../assets/defaultAvatar';
import { 
  X, 
  Send, 
  Paperclip, 
  CheckCheck, 
  User, 
  FileText,
  Download,
  Loader2,
  ExternalLink
} from 'lucide-react';

export const ChatModal: React.FC = () => {
  const { user } = useAuth();
  const { activeChatAppointmentId, closeChat, appointments, addToast } = useApp();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{ name: string; url: string; type: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const appointment = appointments.find(a => a.id === activeChatAppointmentId);

  const isDoctor = user?.role === 'doctor' || user?.role === 'admin_doctor';
  const otherPartyName = isDoctor ? appointment?.patientName : (appointment?.doctorName || 'Dr. Zahid Hussain');
  const otherPartyRole = isDoctor ? 'Patient' : (appointment?.doctorSpecialization || 'Specialist Consultant');

  const loadMessages = async () => {
    if (!activeChatAppointmentId) return;
    try {
      const res = await api.getChatMessages(activeChatAppointmentId);
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMessages();

    // Listen to live SSE events for instant chat delivery
    let unsubscribe: (() => void) | null = null;
    if (user?.id) {
      unsubscribe = api.subscribeEvents(user.id, (event) => {
        if (event.type === 'chat_message' && event.payload?.appointmentId === activeChatAppointmentId) {
          setMessages(prev => {
            const exists = prev.some(m => m.id === event.payload.id);
            if (exists) return prev;
            return [...prev, event.payload];
          });
        }
      });
    }

    const interval = setInterval(loadMessages, 5000);
    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, [activeChatAppointmentId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeChatAppointmentId || !appointment) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Maximum file size allowed is 15MB.'
      });
      return;
    }

    setIsUploading(true);
    try {
      const res = await api.uploadAttachment(file);
      if (res.success && res.url) {
        setPendingAttachment({
          name: res.name || file.name,
          url: res.url,
          type: res.type || 'file'
        });
        addToast({
          type: 'success',
          title: 'Attachment Ready',
          message: `${file.name} uploaded and ready to send.`
        });
      } else {
        addToast({
          type: 'error',
          title: 'Upload Failed',
          message: res.message || 'Could not upload attachment.'
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Upload Error',
        message: err.message || 'Error uploading file.'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !pendingAttachment) || !user) return;
    setIsSending(true);
    const messageContent = text.trim() || (pendingAttachment ? `Shared attachment: ${pendingAttachment.name}` : '');
    
    try {
      const res = await api.sendChatMessage({
        appointmentId: activeChatAppointmentId,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role === 'doctor' || user.role === 'admin_doctor' ? 'doctor' : 'patient',
        senderAvatar: DEFAULT_AVATAR,
        content: messageContent,
        message: messageContent,
        attachment: pendingAttachment || undefined
      });

      if (res.success && (res.chatMessage || res.message)) {
        const newMsg = res.chatMessage || res.message;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setText('');
        setPendingAttachment(null);
      }
    } catch (e) {
      console.error(e);
    }
    setIsSending(false);
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#39393A]/60 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-xl h-[82vh] max-h-[650px] border border-[#D6D6D6] shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Simple Clean Chat Header */}
        <div className="p-4 px-5 bg-[#39393A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={DEFAULT_AVATAR}
                alt={otherPartyName}
                className="w-10 h-10 rounded-full object-cover border border-stone-600 bg-stone-800"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#5B8C5A] ring-2 ring-[#39393A]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{otherPartyName}</h3>
                <span className="text-[10px] font-semibold text-[#5B8C5A] bg-black/30 px-2 py-0.5 rounded">
                  {otherPartyRole}
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                {appointment.date} • {appointment.time || 'Consultation Session'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeChat}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message History Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#E6E6E6]/40">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-stone-400 text-xs">
              <div className="w-12 h-12 rounded-full bg-[#E6E6E6] flex items-center justify-center mx-auto mb-2 text-stone-500">
                <User className="w-6 h-6" />
              </div>
              <p className="font-semibold text-stone-700">Direct Consultation Chat</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Send a message below to communicate directly.</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === user?.id || (isDoctor && msg.senderRole === 'doctor') || (!isDoctor && msg.senderRole === 'patient');
              const messageBody = msg.content || msg.message || '';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-stone-500">
                    <span className="font-medium">{msg.senderName}</span>
                    <span>•</span>
                    <span>{formatMessageTime(msg.timestamp)}</span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-md p-3 rounded-xl text-xs leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-[#39393A] text-white rounded-tr-xs'
                        : 'bg-[#FFFFFF] text-[#39393A] border border-[#D6D6D6] rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{messageBody}</p>
                    
                    {msg.attachment && (
                      <div className="mt-2 pt-2 border-t border-stone-600/30">
                        <a
                          href={msg.attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 p-2 rounded-lg text-[11px] font-semibold transition-colors ${
                            isMe 
                              ? 'bg-black/30 text-stone-100 hover:bg-black/50' 
                              : 'bg-[#E6E6E6] text-[#39393A] hover:bg-[#D6D6D6]'
                          }`}
                        >
                          <FileText className="w-4 h-4 text-[#5B8C5A]" />
                          <span className="truncate max-w-[180px]">{msg.attachment.name}</span>
                          <Download className="w-3.5 h-3.5 opacity-75 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>

                  {isMe && (
                    <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-0.5 pr-1">
                      <CheckCheck className="w-3 h-3 text-[#5B8C5A]" />
                      <span>Delivered</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Attachment Chip */}
        {pendingAttachment && (
          <div className="px-4 py-2 bg-[#5B8C5A]/15 border-t border-[#5B8C5A]/30 flex items-center justify-between text-xs text-[#39393A]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#5B8C5A]" />
              <span className="font-semibold truncate max-w-[260px]">{pendingAttachment.name}</span>
              <span className="text-[10px] text-stone-500">(Ready to send)</span>
            </div>
            <button
              onClick={() => setPendingAttachment(null)}
              className="text-stone-500 hover:text-[#A37774] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-[#FFFFFF] border-t border-[#D6D6D6] shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 text-stone-500 hover:text-[#39393A] rounded-lg hover:bg-[#E6E6E6] transition-colors cursor-pointer disabled:opacity-50"
              title="Attach Medical Report / Document"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#5B8C5A]" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </button>

            <input
              type="text"
              placeholder={`Message ${otherPartyName}...`}
              value={text}
              onChange={e => setText(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 text-[#39393A] focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
            />

            <button
              type="submit"
              disabled={(!text.trim() && !pendingAttachment) || isSending}
              className="bg-[#39393A] hover:bg-[#2A2A2B] disabled:opacity-40 text-white font-bold text-xs p-2.5 rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
