import React, { useEffect, useState } from "react";
import { 
  Megaphone, 
  Search, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Users,
  Building2,
  X,
  Loader2,
  Pin
} from "lucide-react";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { formatDate, cn, handleFirestoreError, OperationType } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  target: 'all' | 'wardens' | 'students';
  hostelId?: string;
  createdAt: string;
}

const AnnouncementPage = () => {
  const { user, role, userData } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: "", content: "", target: "all" as any });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const path = "announcements";
    try {
      const q = query(collection(db, path), orderBy("createdAt", "desc"));
      const snap = await getDocs(q).catch(e => handleFirestoreError(e, OperationType.LIST, path));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      
      console.log("Fetched announcements:", data.length, "Current role:", role);

      // Client side filtering based on role
      const filtered = data.filter(a => {
        if (!role || role === 'admin') return true;
        if (role === 'warden' && (a.target === 'all' || a.target === 'wardens')) return true;
        if (role === 'student' && (a.target === 'all' || a.target === 'students')) return true;
        return false;
      });
      
      setAnnouncements(filtered);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [role]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, "announcements"), {
        ...newNotice,
        authorId: user?.uid,
        authorName: userData?.name || "Anonymous",
        createdAt: new Date().toISOString(),
      });
      setIsModalOpen(false);
      setNewNotice({ title: "", content: "", target: "all" });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Megaphone className="text-indigo-500" />
            Notice Board
          </h1>
          <p className="text-gray-400 mt-1">Official announcements and updates from management.</p>
        </div>
        {role !== 'student' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all font-sans uppercase tracking-widest"
          >
            <Plus size={18} />
            Post Notice
          </button>
        )}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="animate-spin text-indigo-200" size={48} />
            <p className="text-gray-400 font-medium mt-4 italic tracking-wider uppercase text-xs">Broadcasting updates...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
              <Megaphone size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Silence is Golden</h3>
            <p className="text-gray-500 text-sm">No active announcements at the moment.</p>
          </div>
        ) : (
          announcements.map((notice) => (
            <motion.div 
              key={notice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all relative group"
            >
              <div className="absolute top-8 right-8 flex gap-2">
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                  notice.target === 'all' ? "bg-indigo-50 text-indigo-600" :
                  notice.target === 'wardens' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                )}>
                  {notice.target}
                </div>
                {role === 'admin' && (
                  <button 
                    onClick={() => handleDelete(notice.id)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-start gap-6">
                <div className="hidden sm:flex flex-col items-center gap-1 shrink-0 pt-1 text-gray-300">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  <div className="w-px h-12 bg-gray-100" />
                  <Pin size={14} className="rotate-45" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-3 group-hover:text-indigo-600 transition-colors">{notice.title}</h3>
                  <div className="prose prose-indigo max-w-none text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">
                    {notice.content}
                  </div>
                  <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-indigo-400" />
                      <span className="text-gray-900">{notice.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {formatDate(notice.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Post Notice Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">New Announcement</h3>
              <p className="text-gray-500 text-sm mb-8">Share important updates with the hostel community.</p>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Mess Timings Updated"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-bold text-gray-900"
                  />
                </div>
                
                <div className="space-y-2 text-center w-full">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Visibility</label>
                  <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                    {['all', 'students', 'wardens'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewNotice({...newNotice, target: t as any})}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-black uppercase tracking-tighter transition-all rounded-xl",
                          newNotice.target === t ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Message Content</label>
                  <textarea 
                    required
                    rows={6}
                    placeholder="Write your announcement here..."
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium text-gray-800 resize-none line-height-relaxed"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition-colors uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-70 uppercase tracking-widest"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : "Post Notice"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementPage;
