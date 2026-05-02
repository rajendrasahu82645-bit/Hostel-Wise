import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { handleFirestoreError, OperationType, formatDate } from "../lib/utils";
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Clock, 
  User, 
  Phone, 
  FileText,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Visitor {
  id?: string;
  name: string;
  phone: string;
  purpose: string;
  studentId: string;
  entryTime: string;
  exitTime?: string;
  status: 'active' | 'exited';
}

const VisitorManagement = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newVisitor, setNewVisitor] = useState({
    name: "",
    phone: "",
    purpose: "",
    studentId: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchVisitors = async () => {
    setLoading(true);
    const path = "visitors";
    try {
      const q = query(collection(db, path), orderBy("entryTime", "desc"), limit(50));
      const snap = await getDocs(q);
      setVisitors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Visitor)));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const path = "visitors";
    try {
      const visitorData = {
        ...newVisitor,
        entryTime: new Date().toISOString(),
        status: 'active'
      };
      await addDoc(collection(db, path), visitorData);
      setShowAddModal(false);
      setNewVisitor({ name: "", phone: "", purpose: "", studentId: "" });
      fetchVisitors();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Visitor Management</h1>
          <p className="text-gray-500 mt-1">Track and log guests entering hostel premises.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all shadow-lg shadow-white/5 active:scale-95"
        >
          <Plus size={18} />
          Log New Visitor
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by visitor name or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161616] border border-[#222] rounded-2xl px-12 py-3.5 outline-none focus:border-indigo-600 transition-all text-white font-medium"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#161616] border border-[#222] rounded-2xl px-4 py-1.5 overflow-x-auto scrollbar-hide">
          <Filter size={16} className="text-gray-500 flex-shrink-0" />
          {['All', 'Active', 'Exited'].map((status) => (
            <button 
              key={status}
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-[#222] transition-all flex-shrink-0 whitespace-nowrap"
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Visitors List */}
      <div className="bg-[#161616] border border-[#222] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-white/[0.01]">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Visitor / Contact</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Purpose / Student Link</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Entry Time</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={32} />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Syncing with Central Registry...</p>
                  </td>
                </tr>
              ) : filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Users className="text-gray-700 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 font-medium">No visitor logs found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#222] rounded-xl flex items-center justify-center text-gray-400 font-bold group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                          {v.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-200">{v.name}</p>
                          <p className="text-xs text-gray-500">{v.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-300 font-medium">{v.purpose}</p>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">To meet: {v.studentId}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-400 font-medium">
                      {formatDate(v.entryTime)}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        v.status === 'active' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {v.status === 'active' ? (
                          <>
                            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                            On Premises
                          </>
                        ) : 'Exited'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {v.status === 'active' ? (
                        <button className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-widest">Log Exit</button>
                      ) : (
                        <button className="text-xs font-bold text-gray-600 cursor-not-allowed uppercase tracking-widest">Archived</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Visitor Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#161616] border border-[#222] rounded-[2.5rem] p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Access Log Entry</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Register external visitors</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 flex items-center justify-center bg-[#222] text-gray-500 hover:text-white rounded-xl transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleAddVisitor} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <User size={12} /> Full Name
                    </label>
                    <input 
                      type="text" 
                      required
                      value={newVisitor.name}
                      onChange={(e) => setNewVisitor({...newVisitor, name: e.target.value})}
                      placeholder="e.g. Michael Chen"
                      className="w-full bg-[#111] border border-[#222] rounded-2xl px-5 py-4 outline-none focus:border-indigo-600 transition-all text-white font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Phone size={12} /> Contact Number
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={newVisitor.phone}
                      onChange={(e) => setNewVisitor({...newVisitor, phone: e.target.value})}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#111] border border-[#222] rounded-2xl px-5 py-4 outline-none focus:border-indigo-600 transition-all text-white font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Users size={12} /> Student ID to Visit
                  </label>
                  <input 
                    type="text" 
                    required
                    value={newVisitor.studentId}
                    onChange={(e) => setNewVisitor({...newVisitor, studentId: e.target.value})}
                    placeholder="e.g. STU2024001"
                    className="w-full bg-[#111] border border-[#222] rounded-2xl px-5 py-4 outline-none focus:border-indigo-600 transition-all text-white font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <FileText size={12} /> Purpose of Visit
                  </label>
                  <textarea 
                    required
                    value={newVisitor.purpose}
                    onChange={(e) => setNewVisitor({...newVisitor, purpose: e.target.value})}
                    placeholder="Brief description of visit reason..."
                    rows={3}
                    className="w-full bg-[#111] border border-[#222] rounded-2xl px-5 py-4 outline-none focus:border-indigo-600 transition-all text-white font-medium resize-none"
                  />
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-8 py-4 bg-[#222] text-gray-400 font-bold rounded-2xl hover:bg-[#282828] hover:text-white transition-all text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        <CheckCircle2 size={18} />
                        Authorize Entry
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

export default VisitorManagement;
