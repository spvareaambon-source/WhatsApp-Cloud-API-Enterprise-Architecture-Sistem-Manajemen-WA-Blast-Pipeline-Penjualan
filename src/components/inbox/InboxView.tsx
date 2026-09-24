import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Conversation, ConversationMessage } from '../../types';
import { 
  Search, 
  Send, 
  CheckCheck, 
  User, 
  Tag as TagIcon, 
  Plus, 
  Phone, 
  MoreVertical, 
  Zap, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  Sparkles,
  Paperclip,
  Trash2
} from 'lucide-react';
import { formatPhoneDisplay } from '../../utils/phoneNormalizer';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const InboxView: React.FC = () => {
  const { 
    conversations, 
    contacts, 
    sendMessageInConversation, 
    updateConversationStatus, 
    markConversationAsRead,
    deleteConversation,
    addFollowUp
  } = useApp();

  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'FOLLOW-UP' | 'CLOSED'>('ALL');
  const [inputText, setInputText] = useState('');
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(true);
  const [convToDelete, setConvToDelete] = useState<Conversation | null>(null);

  // Canned responses for quick replies
  const quickReplies = [
    'Terima kasih Bapak/Ibu. Margin promo cicil emas 0.75% flat masih berlaku hari ini.',
    'Bisa kami bantu jadwalkan kunjungan ke kantor cabang terdekat?',
    'Berikut kami kirimkan tabel simulasi angsuran resmi Pegadaian.',
    'Apakah berkenan jika kami hubungi melalui telepon untuk penjelasan detail?'
  ];

  const filteredConversations = conversations.filter(c => {
    const contactPhone = c.contactPhone || c.phone || '';
    const matchesSearch = c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || contactPhone.includes(searchTerm);
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus || (filterStatus === 'FOLLOW-UP' && (c.status as string) === 'FOLLOW_UP');
    return matchesSearch && matchesStatus;
  });

  const activeConv = conversations.find(c => c.id === selectedConvId) || conversations[0];
  const activePhone = activeConv ? (activeConv.contactPhone || activeConv.phone) : '';
  const activeContact = contacts.find(c => c.phone === activePhone);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConvId(conv.id);
    if (conv.unreadCount > 0) {
      markConversationAsRead(conv.id);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    sendMessageInConversation(activeConv.id, inputText.trim());
    setInputText('');
  };

  const handleCreateDeal = () => {
    if (!activeConv || !activeContact) return;
    addFollowUp({
      contactId: activeContact.id,
      contactName: activeContact.name,
      phone: activeContact.phone,
      productInterest: activeContact.product,
      pic: activeContact.pic,
      stage: 'INTERESTED',
      priority: 'HIGH',
      potentialValue: 15000000,
      notes: 'Dibuat langsung dari balasan live chat WhatsApp',
      followUpDate: new Date().toISOString().slice(0, 10),
      nextAction: 'Kirim simulasi resmi cicil emas'
    });
    updateConversationStatus(activeConv.id, 'FOLLOW-UP');
  };

  return (
    <div className="h-[calc(100vh-130px)] bg-white rounded-2xl border border-slate-200 shadow-xs flex overflow-hidden">
      {/* Left Column: Conversation List */}
      <div className="w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
        {/* Search & Filter */}
        <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari percakapan nasabah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-transparent focus:border-emerald-500 focus:bg-white rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] font-semibold">
            {['ALL', 'OPEN', 'FOLLOW_UP', 'CLOSED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st as any)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterStatus === st
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.map((conv) => {
            const isSelected = activeConv?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-slate-100/70 bg-white'
                }`}
              >
                <img
                  src={conv.avatar}
                  alt={conv.contactName}
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-slate-900 truncate">{conv.contactName}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{conv.lastMessageAt}</span>
                  </div>

                  <p className="text-xs text-slate-500 truncate leading-snug">
                    {conv.lastMessage}
                  </p>

                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      conv.status === 'OPEN' ? 'bg-blue-50 text-blue-700' :
                      (conv.status === 'FOLLOW-UP' || (conv.status as string) === 'FOLLOW_UP') ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {conv.status}
                    </span>

                    {conv.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Column: Active Chat Area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-[#efeae2]/40">
          {/* Chat Top Bar */}
          <div className="px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={activeConv.avatar}
                alt={activeConv.contactName}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <span>{activeConv.contactName}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                    {formatPhoneDisplay(activeConv.contactPhone || activeConv.phone)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  PIC: <strong className="text-slate-600">{activeConv.assignedPic}</strong> • Cloud API Active
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateDeal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs cursor-pointer"
                title="Masukkan ke Pipeline Sales Deal"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Buat Lead / Deal</span>
              </button>

              <select
                value={activeConv.status}
                onChange={(e) => updateConversationStatus(activeConv.id, e.target.value as any)}
                className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg p-1.5 cursor-pointer"
              >
                <option value="OPEN">Status: OPEN</option>
                <option value="FOLLOW-UP">Status: FOLLOW-UP</option>
                <option value="CLOSED">Status: CLOSED</option>
              </select>

              <button
                onClick={() => setShowCustomerDrawer(p => !p)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                title="Toggle Profil Nasabah"
              >
                <User className="w-4 h-4" />
              </button>

              <button
                onClick={() => setConvToDelete(activeConv)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                title="Hapus Percakapan Ini"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3">
            {activeConv.messages.map((msg) => {
              const isMe = msg.sender === 'AGENT' || msg.sender === 'USER';

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl shadow-xs text-xs space-y-1 leading-relaxed ${
                      isMe
                        ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-xs border border-emerald-200/50'
                        : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-0.5">
                      <span>{msg.timestamp}</span>
                      {isMe && (
                        <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'READ' ? 'text-blue-500' : 'text-slate-400'}`} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Replies Bar */}
          <div className="px-4 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Quick Reply:</span>
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(qr)}
                className="px-2.5 py-1 text-[11px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg border border-slate-200 shrink-0 shadow-2xs cursor-pointer transition-colors"
              >
                {qr.slice(0, 35)}...
              </button>
            ))}
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ketik balasan WhatsApp resmi ke nasabah..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs disabled:opacity-50 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
          Pilih percakapan untuk memulai chat.
        </div>
      )}

      {/* Right Column: Customer Info & Mini CRM */}
      {showCustomerDrawer && activeContact && (
        <div className="w-72 border-l border-slate-200 p-4 bg-white flex flex-col justify-between shrink-0 text-xs overflow-y-auto">
          <div className="space-y-4">
            <div className="text-center pb-3 border-b border-slate-100">
              <img
                src={activeConv?.avatar}
                alt={activeContact.name}
                className="w-16 h-16 rounded-full mx-auto mb-2 object-cover ring-2 ring-emerald-500/30"
              />
              <h4 className="font-bold text-sm text-slate-900">{activeContact.name}</h4>
              <p className="text-[11px] text-slate-500">{activeContact.city}, {activeContact.region}</p>
            </div>

            {/* Attributes */}
            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nomor WhatsApp</span>
                <span className="font-mono font-bold text-slate-800">{activeContact.phone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Produk Minat</span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded w-fit inline-block">
                  {activeContact.product}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Consent / Opt-in</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{activeContact.optInStatus}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sales PIC Bertugas</span>
                <span className="font-semibold text-slate-800">{activeContact.pic}</span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tags</span>
              <div className="flex flex-wrap gap-1">
                {activeContact.tags.map((t, i) => (
                  <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleCreateDeal}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Masukkan ke Pipeline</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Conversation Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!convToDelete}
        onClose={() => setConvToDelete(null)}
        onConfirm={() => {
          if (convToDelete) {
            deleteConversation(convToDelete.id);
            setConvToDelete(null);
            if (activeConv?.id === convToDelete.id) {
              const remaining = conversations.filter(c => c.id !== convToDelete.id);
              if (remaining.length > 0) {
                setSelectedConvId(remaining[0].id);
              }
            }
          }
        }}
        title="Hapus Percakapan Chat?"
        message={`Apakah Anda yakin ingin menghapus seluruh riwayat percakapan dengan "${convToDelete?.contactName}" (${convToDelete?.contactPhone || convToDelete?.phone})? Pesan akan dihapus dari web.`}
        itemName={convToDelete?.contactName}
        confirmText="Hapus Percakapan"
      />
    </div>
  );
};
