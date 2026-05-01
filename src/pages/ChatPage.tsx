import React, { useEffect, useRef, useState } from 'react';
import {
  collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, where, getDocs, doc, getDoc
} from 'firebase/firestore';
import { Send, MessageSquare, Users, Search, Image } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage, UserProfile } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function Avatar({ src, uid, size = 32 }: { src?: string; uid: string; size?: number }) {
  return (
    <img
      src={src || `https://api.dicebear.com/8.x/identicon/svg?seed=${uid}`}
      className="avatar"
      style={{ width: size, height: size, flexShrink: 0 }}
      alt="avatar"
    />
  );
}

export default function ChatPage() {
  const { user, userProfile, isModerator } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load user list (for moderators) or support thread (for users)
  useEffect(() => {
    if (!user) return;
    if (isModerator) {
      getDocs(query(collection(db, 'users'))).then((snap) => {
        setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile)).filter((u) => u.uid !== user.uid));
        setLoadingUsers(false);
      });
    } else {
      setSelectedUser(userProfile);
      setLoadingUsers(false);
    }
  }, [user, isModerator, userProfile]);

  // Subscribe to messages
  useEffect(() => {
    if (!selectedUser) return;
    const chatUserId = isModerator ? selectedUser.uid : user?.uid;
    if (!chatUserId) return;

    const q = query(
      collection(db, 'chats', chatUserId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage)));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    return unsub;
  }, [selectedUser, isModerator, user]);

  const sendMessage = async () => {
    if (!text.trim() || !user || !userProfile || !selectedUser) return;
    setSending(true);
    const chatUserId = isModerator ? selectedUser.uid : user.uid;
    try {
      await addDoc(collection(db, 'chats', chatUserId, 'messages'), {
        sender_id: user.uid,
        sender_email: user.email || '',
        sender_name: userProfile.display_name || '',
        sender_photo: userProfile.photo_url || '',
        text: text.trim(),
        timestamp: serverTimestamp(),
        is_admin: isModerator,
      });
      setText('');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send');
    }
    setSending(false);
  };

  const filteredUsers = users.filter((u) =>
    (u.display_name || u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px - 48px)', gap: 0, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Sidebar: user list (moderators only) */}
      {isModerator && (
        <div style={{ width: 280, background: 'rgba(10,22,40,0.9)', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input className="input" style={{ paddingLeft: 34, fontSize: 13 }} placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingUsers ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><LoadingSpinner /></div>
            ) : filteredUsers.map((u) => (
              <div
                key={u.uid}
                onClick={() => setSelectedUser(u)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', cursor: 'pointer',
                  background: selectedUser?.uid === u.uid ? 'rgba(0,212,255,0.08)' : 'transparent',
                  borderLeft: selectedUser?.uid === u.uid ? '2px solid #00d4ff' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <Avatar src={u.photo_url} uid={u.uid} size={36} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.display_name || u.email}
                  </p>
                  <p style={{ fontSize: 11, color: '#475569', textTransform: 'capitalize' }}>{u.role} · {u.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#050a14' }}>
        {!selectedUser ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#475569' }}>
            <Users size={40} style={{ opacity: 0.3 }} />
            <p>Select a user to start messaging</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(10,22,40,0.9)' }}>
              <Avatar src={isModerator ? selectedUser.photo_url : undefined} uid={isModerator ? selectedUser.uid : 'support'} size={38} />
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{isModerator ? (selectedUser.display_name || selectedUser.email) : 'Velion Support'}</p>
                <p style={{ fontSize: 12, color: '#475569', textTransform: 'capitalize' }}>{isModerator ? selectedUser.role : 'Typical reply time: < 5 mins'}</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#475569', padding: '40px 0' }}>
                  <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                  <p style={{ fontSize: 14, marginBottom: 12 }}>{isModerator ? 'No messages yet.' : 'Open a new support ticket.'}</p>
                  {!isModerator && (
                     <p style={{ fontSize: 12 }}>Please describe your issue in detail. A moderator will respond shortly.</p>
                  )}
                </div>
              )}
              {messages.map((msg) => {
                const isOwn = msg.sender_id === user?.uid;
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                    {!isOwn && <Avatar src={msg.sender_photo} uid={msg.sender_id} size={28} />}
                    <div style={{ maxWidth: '72%' }}>
                      {!isOwn && <p style={{ fontSize: 11, color: '#475569', marginBottom: 3, paddingLeft: 2 }}>{msg.sender_name || msg.sender_email}</p>}
                      <div style={{
                        padding: '10px 14px', borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: isOwn ? 'linear-gradient(135deg, #00d4ff, #0ea5e9)' : 'rgba(255,255,255,0.07)',
                        color: isOwn ? '#050a14' : '#e2e8f0',
                        fontSize: 14, lineHeight: 1.5,
                        border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      }}>
                        {msg.text}
                      </div>
                      <p style={{ fontSize: 10, color: '#475569', marginTop: 3, textAlign: isOwn ? 'right' : 'left' }}>{formatTime(msg.timestamp)}</p>
                    </div>
                    {isOwn && <Avatar src={userProfile?.photo_url} uid={user?.uid || ''} size={28} />}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10, background: 'rgba(10,22,40,0.9)' }}>
              <input
                className="input"
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                style={{ flex: 1 }}
              />
              <button onClick={sendMessage} disabled={sending || !text.trim()} className="btn btn-primary" style={{ padding: '10px 16px', gap: 6 }}>
                {sending ? <LoadingSpinner size="sm" /> : <Send size={16} />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
