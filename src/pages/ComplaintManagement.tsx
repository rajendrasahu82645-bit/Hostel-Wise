import React, { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Send,
  Loader2,
  Calendar
} from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { cn, formatDate, handleFirestoreError, OperationType } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

const ComplaintManagement = () => {
  const { user, role, userData } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ subject: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionText, setResolutionText] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setErrorMsg(null);
    const path = "complaints";
    try {
      let q;
      // Try ordered query first
      try {
        if (role === 'student') {
          q = query(collection(db, path), where("studentId", "==", user?.uid), orderBy("createdAt", "desc"));
        } else {
          q = query(collection(db, path), orderBy("createdAt", "desc"));
        }
        const snap = await getDocs(q).catch(() => null);
        
        if (snap) {
          const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Complaint));
          setComplaints(data);
          return;
        }
      } catch (e) {
        console.warn("Ordered query failed, falling back to unordered", e);
      }

      // Fallback: Unordered query (no index required)
      if (role === 'student') {
        q = query(collection(db, path), where("studentId", "==", user?.uid));
      } else {
        q = query(collection(db, path));
      }
      
      const snap = await getDocs(q).catch(e => {
        const info = JSON.parse(e.message);
        if (info.error.includes("offline") || info.error.includes("reach backend")) {
          setErrorMsg("The system is currently in offline mode. Please check your internet connection.");
        }
        return handleFirestoreError(e, OperationType.LIST, path);
      });
      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Complaint))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort in memory
      
      setComplaints(data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && role) fetchComplaints();
  }, [user, role]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const complaintData = {
        studentId: user?.uid,
        studentName: userData?.name || "Anonymous",
        subject: newComplaint.subject,
        description: newComplaint.description,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "complaints"), complaintData)
        .catch(e => handleFirestoreError(e, OperationType.CREATE, "complaints"));
      setNewComplaint({ subject: "", description: "" });
      setIsModalOpen(false);
      fetchComplaints();
    } catch (error: any) {
      console.error("Error creating complaint:", error);
      try {
        const info = JSON.parse(error.message);
        setErrorMsg(`Failed to submit: ${info.error}`);
      } catch {
        setErrorMsg("Failed to connect to the backend. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, "complaints", selectedComplaint.id), {
        status: 'resolved',
        resolution: resolutionText,
        resolvedBy: user?.uid,
        updatedAt: new Date().toISOString(),
      });
      setSelectedComplaint(null);
      setResolutionText("");
      fetchComplaints();
    } catch (error) {
      console.error("Error resolving complaint:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcons = {
    'open': { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
    'in-progress': { icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
    'resolved': { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Complaints & Requests</h1>
          <p className="text-gray-400 mt-1">Submit issues or track their status.</p>
        </div>
        {role === 'student' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={18} />
            New Complaint
          </button>
        )}
      </div>
      
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-100 rounded-xl pl-12 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold border border-transparent hover:border-gray-200 transition-all">
          <Filter size={18} />
          Filter Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center">
            <Loader2 className="animate-spin text-gray-300" size={40} />
            <p className="mt-4 text-gray-500 font-medium tracking-wide italic">Fetching complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-4">
              <MessageSquare size={32} />
            </div>
            <p className="text-gray-500 font-medium">No complaints found.</p>
          </div>
        ) : complaints.filter(c => c.subject.toLowerCase().includes(searchTerm.toLowerCase())).map((complaint) => {
          const StatusIcon = statusIcons[complaint.status].icon;
          return (
            <motion.div 
              key={complaint.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col relative group overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2 rounded-xl", statusIcons[complaint.status].bg, statusIcons[complaint.status].color)}>
                  <StatusIcon size={20} />
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                    statusIcons[complaint.status].bg, statusIcons[complaint.status].color
                  )}>
                    {complaint.status}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{complaint.subject}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-3">{complaint.description}</p>

              <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
                    {complaint.studentName.substring(0, 1)}
                  </div>
                  <span className="text-xs font-bold text-gray-400 tracking-tight">{complaint.studentName}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Calendar size={12} />
                  {formatDate(complaint.createdAt)}
                </div>
              </div>

              {role !== 'student' && complaint.status !== 'resolved' && (
                <button 
                  onClick={() => setSelectedComplaint(complaint)}
                  className="mt-6 w-full bg-gray-50 hover:bg-indigo-600 hover:text-white text-gray-600 font-bold py-3 rounded-xl text-xs transition-all uppercase tracking-widest"
                >
                  Action Required
                </button>
              )}
              
              {complaint.status === 'resolved' && (
                <div className="mt-4 p-4 bg-green-50/50 rounded-2xl border border-green-100">
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Resolution:</p>
                  <p className="text-xs text-green-700 italic">"{complaint.resolution}"</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* New Complaint Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Raise Complaint</h3>
              <p className="text-gray-500 text-sm mb-8">Explain your issue clearly for faster resolution.</p>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Broken Light in Room B20"
                    value={newComplaint.subject}
                    onChange={(e) => setNewComplaint({...newComplaint, subject: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describe the issue in detail..."
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-70 uppercase tracking-widest"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : "Submit"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resolution Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-tight">Resolve Complaint</h3>
              <div className="p-4 bg-gray-50 rounded-2xl mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Issue:</p>
                <p className="text-sm font-bold text-gray-700">{selectedComplaint.subject}</p>
              </div>

              <form onSubmit={handleResolve} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Resolution Remark</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describe how the issue was resolved..."
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-indigo-600 transition-all font-medium resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="flex-1 px-6 py-4 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-widest"
                  >
                    Close
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all disabled:opacity-70 uppercase tracking-widest"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        <CheckCircle2 size={18} />
                        Mark Resolved
                      </>
                    )}
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

export default ComplaintManagement;
