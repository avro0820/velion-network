import React, { useEffect, useState } from 'react';
import {
  collection, addDoc, getDocs, updateDoc, doc, serverTimestamp, query, orderBy, limit, onSnapshot, arrayUnion, arrayRemove, getDoc
} from 'firebase/firestore';
import { Heart, MessageCircle, Send, Image, Users, TrendingUp, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Post, PostComment, UserProfile } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function Avatar({ src, uid, size = 36 }: { src?: string; uid: string; size?: number }) {
  return (
    <img
      src={src || `https://api.dicebear.com/8.x/identicon/svg?seed=${uid}`}
      className="avatar"
      style={{ width: size, height: size, flexShrink: 0 }}
      alt="avatar"
    />
  );
}

function PostCard({ post, currentUid, onLike }: { post: Post; currentUid: string; onLike: (id: string) => void }) {
  const liked = post.likes?.includes(currentUid);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const { userProfile } = useAuth();

  const formatDate = (ts: any) => {
    if (!ts) return '';
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const loadComments = async () => {
    setLoadingComments(true);
    const snap = await getDocs(query(collection(db, 'posts', post.id, 'comments'), orderBy('created_at', 'asc')));
    setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PostComment)));
    setLoadingComments(false);
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments((s) => !s);
  };

  const submitComment = async () => {
    if (!comment.trim() || !userProfile) return;
    const newComment = {
      author_id: userProfile.uid,
      author_name: userProfile.display_name || userProfile.email,
      author_photo: userProfile.photo_url || '',
      text: comment.trim(),
      created_at: serverTimestamp(),
    };
    await addDoc(collection(db, 'posts', post.id, 'comments'), newComment);
    await updateDoc(doc(db, 'posts', post.id), { comment_count: (post.comment_count || 0) + 1 });
    setComments((prev) => [...prev, { ...newComment, id: Date.now().toString(), created_at: new Date().toISOString() } as PostComment]);
    setComment('');
  };

  return (
    <div className="glass" style={{ padding: 22 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <Avatar src={post.author_photo} uid={post.author_id} size={42} />
        <div>
          <p style={{ fontWeight: 700, fontSize: 15 }}>{post.author_name}</p>
          {post.author_username && <p style={{ fontSize: 12, color: '#475569' }}>@{post.author_username}</p>}
          <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{formatDate(post.created_at)}</p>
        </div>
      </div>

      <p style={{ fontSize: 15, lineHeight: 1.7, color: '#e2e8f0', marginBottom: post.image_url ? 14 : 0 }}>
        {post.content}
      </p>

      {post.image_url && (
        <img src={post.image_url} alt="Post" style={{ width: '100%', borderRadius: 10, marginBottom: 14, maxHeight: 400, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' }} />
      )}

      {post.platform_tags && post.platform_tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {post.platform_tags.map((tag) => (
            <span key={tag} className="badge badge-cyan" style={{ fontSize: 10 }}>#{tag}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => onLike(post.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#ef4444' : '#94a3b8', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'color 0.15s' }}
        >
          <Heart size={16} fill={liked ? '#ef4444' : 'none'} />
          {post.likes?.length || 0}
        </button>
        <button
          onClick={toggleComments}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'color 0.15s' }}
        >
          <MessageCircle size={16} />
          {post.comment_count || 0}
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {loadingComments ? <LoadingSpinner size="sm" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {comments.map((c) => (
                <div key={c.id} style={{ display: 'flex', gap: 8 }}>
                  <Avatar src={c.author_photo} uid={c.author_id} size={28} />
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 12px', flex: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 2 }}>{c.author_name}</p>
                    <p style={{ fontSize: 13, color: '#e2e8f0' }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              className="input"
              style={{ flex: 1, fontSize: 13, padding: '8px 12px' }}
              placeholder="Write a comment…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitComment(); }}
            />
            <button onClick={submitComment} className="btn btn-primary" style={{ padding: '8px 12px' }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NetworkPage() {
  const { user, userProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('created_at', 'desc'), limit(30));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post)));
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    getDocs(query(collection(db, 'users'), limit(5))).then((snap) => {
      setSuggestedUsers(
        snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile))
          .filter((u) => u.uid !== user?.uid && u.status === 'approved')
          .slice(0, 4)
      );
    }).catch(() => {});
  }, [user]);

  const submitPost = async () => {
    if (!newPost.trim() || !user || !userProfile) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        author_id: user.uid,
        author_name: userProfile.display_name || userProfile.email,
        author_photo: userProfile.photo_url || '',
        author_username: userProfile.username || '',
        content: newPost.trim(),
        likes: [],
        comment_count: 0,
        created_at: serverTimestamp(),
      });
      setNewPost('');
      toast.success('Posted!');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to post');
    }
    setPosting(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    const postRef = doc(db, 'posts', postId);
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const liked = post.likes?.includes(user.uid);
    await updateDoc(postRef, { likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
  };

  const handleFollow = async (targetUid: string) => {
    if (!user || !userProfile) return;
    const myRef = doc(db, 'users', user.uid);
    const targetRef = doc(db, 'users', targetUid);
    const alreadyFollowing = userProfile.following?.includes(targetUid);
    await Promise.all([
      updateDoc(myRef, { following: alreadyFollowing ? arrayRemove(targetUid) : arrayUnion(targetUid) }),
      updateDoc(targetRef, { followers: alreadyFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid) }),
    ]);
    toast.success(alreadyFollowing ? 'Unfollowed' : 'Following!');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, maxWidth: 1100, alignItems: 'start' }}>
      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Compose */}
        <div className="glass" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <img
              src={userProfile?.photo_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${user?.uid}`}
              className="avatar"
              style={{ width: 42, height: 42 }}
              alt="me"
            />
            <div style={{ flex: 1 }}>
              <textarea
                className="input"
                style={{ minHeight: 90, resize: 'none', fontSize: 15 }}
                placeholder="Share an intelligence update, finding, or insight…"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button onClick={submitPost} disabled={posting || !newPost.trim()} className="btn btn-primary" style={{ gap: 8 }}>
                  {posting ? <LoadingSpinner size="sm" /> : <><Send size={15} /> Post</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><LoadingSpinner size="lg" /></div>
        ) : posts.length === 0 ? (
          <div className="glass" style={{ padding: 60, textAlign: 'center', color: '#475569' }}>
            <TrendingUp size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No posts yet. Be the first!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUid={user?.uid || ''} onLike={handleLike} />
          ))
        )}
      </div>

      {/* Sidebar: Suggested Users */}
      <div style={{ position: 'sticky', top: 0 }}>
        <div className="glass" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Users size={16} color="#00d4ff" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              People to Follow
            </h3>
          </div>
          {suggestedUsers.length === 0 ? (
            <p style={{ color: '#475569', fontSize: 13 }}>No suggestions yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {suggestedUsers.map((u) => (
                <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img
                    src={u.photo_url || `https://api.dicebear.com/8.x/identicon/svg?seed=${u.uid}`}
                    className="avatar"
                    style={{ width: 38, height: 38 }}
                    alt="user"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.display_name || u.email?.split('@')[0]}
                    </p>
                    <p style={{ fontSize: 11, color: '#475569', textTransform: 'capitalize' }}>{u.role}</p>
                  </div>
                  <button
                    onClick={() => handleFollow(u.uid)}
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '4px 10px' }}
                  >
                    {userProfile?.following?.includes(u.uid) ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
